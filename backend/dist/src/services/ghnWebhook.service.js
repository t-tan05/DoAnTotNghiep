import prisma from "#config/prisma";
import { mapGhnStatusToOrderStatus } from "#utils/ghnStatus";
import { devices_status, orders_payment_status, payment_transactions_status } from "@prisma/client";
import { emitDashboardUpdate, getIO } from "../socket.js";
import logger from "#config/logger";
const addMonth = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
async function emitGhnOrderUpdated(order) {
    try {
        const socketPayload = {
            eventType: "ghn_webhook",
            orderId: order.order_id,
            status: order.status,
            paymentStatus: order.payment_status,
            employeeId: order.employee_id,
            ghnStatus: order.ghn_status,
            ghnOrderCode: order.ghn_order_code,
            updatedAt: order.updated_at || new Date(),
        };
        getIO().to("admin").emit("order:updated", socketPayload);
        if (order.user_id) {
            getIO().to(`user:${order.user_id}`).emit("order:updated", socketPayload);
        }
        await emitDashboardUpdate();
    }
    catch (error) {
        logger.error({ err: error }, "Emit GHN webhook update failed");
    }
}
export const handleGhnOrderStatusWebhookService = async (payload) => {
    const orderCode = payload.OrderCode || payload.order_code;
    const ghnStatus = payload.Status || payload.status;
    if (!orderCode || !ghnStatus) {
        return;
    }
    const order = await prisma.orders.findFirst({
        where: {
            ghn_order_code: String(orderCode),
        },
        include: {
            orders_details: {
                include: {
                    product_variants: {
                        include: {
                            products: true,
                        },
                    },
                },
            },
        },
    });
    if (!order)
        return;
    let updatedOrder;
    if (ghnStatus === "delivered") {
        updatedOrder = await handleDeliveredOrder(order, payload, ghnStatus);
    }
    else {
        const nextStatus = mapGhnStatusToOrderStatus(ghnStatus);
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                ...(nextStatus ? { status: nextStatus } : {}),
                ghn_status: ghnStatus,
                ghn_raw_response: payload,
                ...(ghnStatus === "delivery_fail" ? { delivery_failed_at: new Date() } : {}),
                ...(["cancel", "cancelled"].includes(ghnStatus) ? { cancelled_at: new Date() } : {}),
            },
        });
    }
    await emitGhnOrderUpdated(updatedOrder);
};
async function handleDeliveredOrder(order, payload, ghnStatus) {
    return prisma.$transaction(async (tx) => {
        const soldDate = new Date();
        for (const detail of order.orders_details) {
            const warrantyPeriod = detail.product_variants.products.warranty_period;
            const warrantyEndDate = warrantyPeriod > 0
                ? addMonth(soldDate, warrantyPeriod)
                : null;
            await tx.devices.updateMany({
                where: {
                    order_detail_id: detail.order_detail_id,
                    status: devices_status.RESERVED,
                },
                data: {
                    status: devices_status.SOLD,
                    sold_date: soldDate,
                    warranty_end_date: warrantyEndDate,
                },
            });
        }
        const completedOrder = await tx.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status: "COMPLETED",
                ghn_status: ghnStatus,
                completed_at: soldDate,
                ...(order.payment_method === "COD"
                    ? { payment_status: orders_payment_status.PAID }
                    : {}),
                ghn_raw_response: payload,
            },
        });
        if (order.payment_method === "COD") {
            await tx.payment_transactions.updateMany({
                where: {
                    order_id: order.order_id,
                    payment_method: "COD",
                    status: payment_transactions_status.PENDING,
                },
                data: {
                    status: payment_transactions_status.SUCCESS,
                    paid_at: soldDate,
                    updated_at: soldDate,
                },
            });
        }
        return completedOrder;
    });
}
