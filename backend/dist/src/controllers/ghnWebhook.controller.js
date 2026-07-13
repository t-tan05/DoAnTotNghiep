import prisma from "#config/prisma";
import { CatchAsync } from "#utils/CatchAsync";
import { devices_status, orders_payment_status, orders_status, payment_transactions_status } from "@prisma/client";
import { emitDashboardUpdate, getIO } from "../socket.js";
const addMonth = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
export const ghnOrderStatusWebhookController = CatchAsync(async (req, res) => {
    const payload = req.body;
    const orderCode = payload.OrderCode || payload.order_code;
    const ghnStatus = payload.Status || payload.status;
    if (!orderCode || !ghnStatus) {
        return res.status(200).json({
            success: true,
            message: "Missing order code or status, ignored.",
        });
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
    if (!order) {
        return res.status(200).json({
            success: true,
            message: "Order not found, ignored.",
        });
    }
    let updatedOrder;
    if (ghnStatus === "delivered") {
        updatedOrder = await prisma.$transaction(async (tx) => {
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
                    status: orders_status.COMPLETED,
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
    else if (ghnStatus === "delivery_fail") {
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status: orders_status.DELIVERY_FAILED,
                ghn_status: ghnStatus,
                delivery_failed_at: new Date(),
                ghn_raw_response: payload,
            },
        });
    }
    else if (["cancel", "cancelled"].includes(ghnStatus)) {
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status: orders_status.CANCELLED,
                ghn_status: ghnStatus,
                cancelled_at: new Date(),
                ghn_raw_response: payload,
            },
        });
    }
    else if (["waiting_to_return", "return", "returned"].includes(ghnStatus)) {
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status: orders_status.RETURNED,
                ghn_status: ghnStatus,
                ghn_raw_response: payload,
            },
        });
    }
    else if (["ready_to_pick", "picking", "picked", "transporting", "sorting", "delivering"].includes(ghnStatus)) {
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status: orders_status.SHIPPED,
                ghn_status: ghnStatus,
                ghn_raw_response: payload,
            },
        });
    }
    else {
        updatedOrder = await prisma.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                ghn_status: ghnStatus,
                ghn_raw_response: payload,
            },
        });
    }
    try {
        const socketPayload = {
            eventType: "ghn_webhook",
            orderId: updatedOrder.order_id,
            status: updatedOrder.status,
            paymentStatus: updatedOrder.payment_status,
            employeeId: updatedOrder.employee_id,
            ghnStatus: updatedOrder.ghn_status,
            ghnOrderCode: updatedOrder.ghn_order_code,
            updatedAt: updatedOrder.updated_at || new Date(),
        };
        getIO().to("admin").emit("order:updated", socketPayload);
        if (updatedOrder.user_id) {
            getIO().to(`user:${updatedOrder.user_id}`).emit("order:updated", socketPayload);
        }
        await emitDashboardUpdate();
    }
    catch (error) {
        console.error("Emit GHN webhook update failed:", error);
    }
    res.status(200).json({
        success: true,
        message: "Webhook received.",
    });
});
