import prisma from "#config/prisma";
import AppError from "#utils/AppError";
import { devices_status, orders_payment_status, orders_status, payment_transactions_status, } from "@prisma/client";
import crypto from "crypto";
import { findMyOrders, findOrderDetailForUser, findOrderDetailForStaff, getOrderWithQuery, findOrderById, update, } from "#models/order.model";
import { createVnpayPaymentUrl, refundVnpayPayment, verifyVnpayReturn } from "./vnpay.service.js";
import { findUserById } from "#models/user.model";
const PAYMENT_TRANSACTION_REFUND_PENDING = "REFUND_PENDING";
const PAYMENT_TRANSACTION_REFUND_FAILED = "REFUND_FAILED";
const ORDER_PAYMENT_REFUND_PENDING = "REFUND_PENDING";
const ORDER_PAYMENT_REFUND_FAILED = "REFUND_FAILED";
const getAvailableQuantity = (variant) => {
    return Number(variant.quantity_in_stock) - Number(variant.reserved_quantity ?? 0);
};
const getActivePromotion = (product) => {
    const now = new Date();
    return product.products_promotions
        ?.map((item) => item.promotions)
        ?.filter((promotion) => {
        return new Date(promotion.start_date) <= now && new Date(promotion.end_date) >= now;
    })?.[0];
};
const calculatePrice = (variant) => {
    const originalPrice = Number(variant.price);
    const promotion = getActivePromotion(variant.products);
    if (!promotion)
        return originalPrice;
    const discountValue = Number(promotion.discount_value);
    if (promotion.discount_type === "PERCENT") {
        return Math.max(originalPrice - originalPrice * discountValue / 100, 0);
    }
    return Math.max(originalPrice - discountValue, 0);
};
const parseVnpayDate = (value) => {
    if (!value || value.length !== 14)
        return new Date();
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(8, 10));
    const minute = Number(value.slice(10, 12));
    const second = Number(value.slice(12, 14));
    return new Date(year, month, day, hour, minute, second);
};
const getVnpayRefundState = (refundResult) => {
    const responseCode = String(refundResult?.vnp_ResponseCode || "");
    const transactionStatus = String(refundResult?.vnp_TransactionStatus || "");
    const message = refundResult?.vnp_Message || refundResult?.vnp_ResponseMessage;
    if (responseCode === "00" && transactionStatus === "00") {
        return {
            transactionStatus: payment_transactions_status.REFUNDED,
            orderPaymentStatus: orders_payment_status.REFUNDED,
            paymentStatus: "REFUNDED",
            message: "VNPay đã hoàn tiền thành công.",
        };
    }
    if (responseCode === "00" && (!transactionStatus || ["05", "06"].includes(transactionStatus))) {
        return {
            transactionStatus: PAYMENT_TRANSACTION_REFUND_PENDING,
            orderPaymentStatus: ORDER_PAYMENT_REFUND_PENDING,
            paymentStatus: "REFUND_PENDING",
            message: "Yêu cầu hoàn tiền đã được gửi sang VNPay và đang chờ ngân hàng xử lý.",
        };
    }
    if (responseCode === "94") {
        return {
            transactionStatus: PAYMENT_TRANSACTION_REFUND_PENDING,
            orderPaymentStatus: ORDER_PAYMENT_REFUND_PENDING,
            paymentStatus: "REFUND_PENDING",
            message: "Yêu cầu hoàn tiền đã tồn tại và VNPay đang xử lý.",
        };
    }
    if (responseCode === "95" || transactionStatus === "09") {
        return {
            transactionStatus: PAYMENT_TRANSACTION_REFUND_FAILED,
            orderPaymentStatus: ORDER_PAYMENT_REFUND_FAILED,
            paymentStatus: "REFUND_FAILED",
            message: message || "VNPay từ chối hoặc xử lý hoàn tiền thất bại.",
        };
    }
    throw new AppError(message || "Hoàn tiền thất bại.", 400);
};
export const checkoutOrderService = async (userId, payload, ipAddr) => {
    return prisma.$transaction(async (tx) => {
        const address = await tx.addresses.findFirst({
            where: {
                address_id: payload.addressId,
                user_id: userId,
            },
        });
        if (!address)
            throw new AppError("Địa chỉ giao hàng không tồn tại.", 404);
        const cart = await tx.carts.findUnique({
            where: {
                user_id: userId,
            },
            include: {
                carts_items: {
                    include: {
                        product_variants: true,
                    },
                },
            },
        });
        if (!cart || cart.carts_items.length === 0) {
            throw new AppError("Giỏ hàng đang trống.", 400);
        }
        for (const item of cart.carts_items) {
            const variant = item.product_variants;
            if (!variant) {
                throw new AppError("Sản phẩm trong giỏ hàng không tồn tại.", 404);
            }
            const availableQuantity = getAvailableQuantity(variant);
            if (item.quantity > availableQuantity) {
                throw new AppError(`Sản phẩm ${variant.sku} không đủ số lượng trong kho.`, 400);
            }
            const availableDeviceCount = await tx.devices.count({
                where: {
                    variant_id: item.variant_id,
                    status: devices_status.AVAILABLE,
                },
            });
            if (availableDeviceCount < item.quantity) {
                throw new AppError(`SKU ${variant.sku} không đủ thiết bị khả dụng.`, 400);
            }
        }
        const totalPrice = cart.carts_items.reduce((sum, item) => {
            return sum + Number(item.price_at_add) * item.quantity;
        }, 0);
        const orderId = crypto.randomUUID();
        const paymentStatus = payload.paymentMethod === "COD"
            ? orders_payment_status.UNPAID
            : orders_payment_status.PENDING;
        const order = await tx.orders.create({
            data: {
                order_id: orderId,
                user_id: userId,
                address_id: address.address_id,
                total_price: totalPrice,
                status: orders_status.PENDING,
                payment_method: payload.paymentMethod,
                payment_status: paymentStatus,
                receiver_name: address.receiver_name,
                receiver_phone: address.phone_number,
            },
        });
        const orderDetails = cart.carts_items.map((item) => ({
            order_detail_id: crypto.randomUUID(),
            order_id: orderId,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price_at_add,
        }));
        await tx.orders_details.createMany({
            data: orderDetails,
        });
        for (const detail of orderDetails) {
            const devices = await tx.devices.findMany({
                where: {
                    variant_id: detail.variant_id,
                    status: devices_status.AVAILABLE,
                },
                take: detail.quantity,
                orderBy: {
                    device_id: "asc",
                },
            });
            if (devices.length < detail.quantity) {
                throw new AppError("Không đủ thiết bị khả dụng để giữ hàng.", 400);
            }
            const updated = await tx.devices.updateMany({
                where: {
                    device_id: {
                        in: devices.map((device) => device.device_id),
                    },
                    status: devices_status.AVAILABLE,
                },
                data: {
                    status: devices_status.RESERVED,
                    order_detail_id: detail.order_detail_id,
                },
            });
            if (updated.count !== detail.quantity) {
                throw new AppError("Thiết bị vừa được giữ bởi đơn hàng khác, vui lòng thử lại.", 409);
            }
        }
        const paymentTransaction = await tx.payment_transactions.create({
            data: {
                transaction_id: crypto.randomUUID(),
                order_id: orderId,
                payment_method: payload.paymentMethod,
                amount: totalPrice,
                status: payment_transactions_status.PENDING,
                provider: payload.paymentMethod,
            },
        });
        const paymentUrl = payload.paymentMethod === "VNPAY"
            ? createVnpayPaymentUrl({
                txnRef: paymentTransaction.transaction_id,
                orderId,
                amount: totalPrice,
                ipAddr,
            })
            : null;
        await tx.carts_items.deleteMany({
            where: {
                cart_id: cart.cart_id,
            },
        });
        return { order, paymentUrl };
    });
};
export const getMyOrdersService = async (userId) => {
    const orders = await findMyOrders(userId);
    return { orders };
};
export const getMyOrderDetailService = async (userId, orderId) => {
    const order = await findOrderDetailForUser(orderId, userId);
    if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }
    return { order };
};
const refundPaidVnpayOrder = async (params) => {
    const paymentTransaction = await prisma.payment_transactions.findFirst({
        where: {
            order_id: params.orderId,
            payment_method: "VNPAY",
            status: payment_transactions_status.SUCCESS,
        },
        orderBy: {
            paid_at: "desc",
        },
    });
    if (!paymentTransaction) {
        throw new AppError("Không tìm thấy giao dịch VNPay đã thanh toán.", 404);
    }
    if (!paymentTransaction.transaction_code || !paymentTransaction.paid_at) {
        throw new AppError("Giao dịch VNPay thiếu thông tin để hoàn tiền.", 400);
    }
    const refundResult = await refundVnpayPayment({
        txnRef: paymentTransaction.transaction_id,
        orderId: params.orderId,
        amount: params.amount,
        transactionCode: paymentTransaction.transaction_code,
        transactionDate: paymentTransaction.paid_at,
        createBy: params.userId,
        ipAddr: params.ipAddr,
    });
    return {
        paymentTransaction,
        refundResult,
    };
};
export const cancelMyOrderService = async (userId, orderId, ipAddr) => {
    //Cập nhật thêm index
    const order = await prisma.orders.findFirst({
        where: {
            order_id: orderId,
            user_id: userId,
        },
    });
    if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }
    if (order.status !== orders_status.PENDING) {
        throw new AppError("Chỉ có thể hủy đơn hàng đang chờ xử lý.", 400);
    }
    if (order.payment_status === orders_payment_status.PAID) {
        if (order.payment_method !== "VNPAY") {
            throw new AppError("Đơn đã thanh toán nhưng chưa hỗ trợ hoàn tiền cho phương thức này.", 400);
        }
        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId,
            ipAddr,
        });
        const refundState = getVnpayRefundState(refundResult);
        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: refundState.transactionStatus,
                    provider_response: JSON.stringify(refundResult),
                    updated_at: new Date(),
                },
            });
            return tx.orders.update({
                where: {
                    order_id: orderId,
                },
                data: {
                    status: orders_status.CANCELLED,
                    payment_status: refundState.orderPaymentStatus,
                },
            });
        });
        return { order: updatedOrder };
    }
    const updatedOrder = await prisma.orders.update({
        where: {
            order_id: orderId,
        },
        data: {
            status: orders_status.CANCELLED,
        },
    });
    return { order: updatedOrder };
};
export const getAllOrdersService = async (params) => {
    const { orders, totalItems } = await getOrderWithQuery(params);
    return {
        orders,
        meta: {
            pagination: {
                page: params.page,
                limit: params.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / params.limit),
            },
            sort: {
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            },
            filters: {
                search: params.search,
                status: params.status,
                paymentStatus: params.paymentStatus,
                paymentMethod: params.paymentMethod,
                fromDate: params.fromDate,
                toDate: params.toDate,
            },
        },
    };
};
export const getOrderDetailForStaffService = async (orderId) => {
    const order = await findOrderDetailForStaff(orderId);
    if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }
    return { order };
};
export const confirmOrderService = async (orderId, employeeId) => {
    const order = await findOrderById(orderId);
    if (!order)
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    if (order.status !== orders_status.PENDING) {
        throw new AppError("Chỉ có thể xác nhận đơn hàng đang chờ xử lý.", 400);
    }
    if (order.payment_method !== "COD" && order.payment_status !== orders_payment_status.PAID) {
        throw new AppError("Đơn hàng thanh toán online chưa thanh toán thành công.", 400);
    }
    const updateOrder = await update(orderId, {
        status: orders_status.CONFIRMED,
        employee_id: employeeId,
    });
    return { order: updateOrder };
};
export const shipOrderService = async (orderId, employeeId) => {
    const order = await findOrderById(orderId);
    if (!order)
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    if (order.status !== orders_status.CONFIRMED) {
        throw new AppError("Chỉ có thể giao đơn hàng đã xác nhận.", 400);
    }
    const updateOrder = await update(orderId, {
        status: orders_status.SHIPPED,
        employee_id: employeeId,
    });
    return { order: updateOrder };
};
//Tạo hàm tính tháng cho warranty_end_date
const addMonth = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
export const completeOrderService = async (orderId, employeeId) => {
    return prisma.$transaction(async (tx) => {
        const order = await tx.orders.findUnique({
            where: {
                order_id: orderId,
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
            throw new AppError("Không tìm thấy đơn hàng.", 404);
        }
        if (order.status !== orders_status.SHIPPED) {
            throw new AppError("Chỉ có thể hoàn tất đơn hàng đang giao.", 400);
        }
        const soldDate = new Date();
        for (const detail of order.orders_details) {
            const warrantyPeriod = detail.product_variants.products.warranty_period;
            const warrantyEndDate = warrantyPeriod > 0
                ? addMonth(soldDate, warrantyPeriod)
                : null;
            const updated = await tx.devices.updateMany({
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
            if (updated.count !== detail.quantity) {
                throw new AppError("Số lượng thiết bị giữ cho đơn hàng không khớp.", 409);
            }
        }
        const shouldMarkCodPaid = order.payment_method === "COD";
        if (shouldMarkCodPaid) {
            await tx.payment_transactions.updateMany({
                where: {
                    order_id: orderId,
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
        const updateOrder = await tx.orders.update({
            where: {
                order_id: orderId,
            },
            data: {
                status: orders_status.COMPLETED,
                employee_id: employeeId,
                ...(shouldMarkCodPaid
                    ? {
                        payment_status: orders_payment_status.PAID,
                    }
                    : {}),
            },
        });
        return {
            order: updateOrder,
        };
    });
};
export const cancelOrderForStaffService = async (orderId, employeeId, ipAddr) => {
    const order = await findOrderById(orderId);
    if (!order)
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    const cannotCancelStatuses = new Set([
        orders_status.COMPLETED,
        orders_status.CANCELLED,
        orders_status.RETURNED,
    ]);
    if (cannotCancelStatuses.has(order.status)) {
        throw new AppError("Không thể hủy đơn hàng ở trạng thái hiện tại.", 400);
    }
    if (order.payment_status === orders_payment_status.PAID) {
        if (order.payment_method !== "VNPAY") {
            throw new AppError("Đơn đã thanh toán nhưng chưa hỗ trợ hoàn tiền cho phương thức này.", 400);
        }
        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId: employeeId,
            ipAddr,
        });
        const refundState = getVnpayRefundState(refundResult);
        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: refundState.transactionStatus,
                    provider_response: JSON.stringify(refundResult),
                    updated_at: new Date(),
                },
            });
            return tx.orders.update({
                where: {
                    order_id: orderId,
                },
                data: {
                    status: orders_status.CANCELLED,
                    payment_status: refundState.orderPaymentStatus,
                    employee_id: employeeId,
                },
            });
        });
        return { order: updatedOrder };
    }
    const updateOrder = await update(orderId, {
        status: orders_status.CANCELLED,
        employee_id: employeeId,
    });
    return { order: updateOrder };
};
export const markDeliveryFailedService = async (orderId, employeeId, ipAddr) => {
    const order = await findOrderById(orderId);
    if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }
    if (order.status !== orders_status.SHIPPED) {
        throw new AppError("Chỉ có thể đánh dấu giao hàng thất bại với đơn đang giao.", 400);
    }
    if (order.payment_status === orders_payment_status.PAID) {
        if (order.payment_method !== "VNPAY") {
            throw new AppError("Đơn hàng đã được thanh toán, tuy nhiên hiện tại hệ thống chưa hỗ trợ hoàn tiền đối với phương thức thanh toán này.", 400);
        }
        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId: employeeId,
            ipAddr,
        });
        const refundState = getVnpayRefundState(refundResult);
        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: refundState.transactionStatus,
                    provider_response: JSON.stringify(refundResult),
                    updated_at: new Date(),
                },
            });
            return tx.orders.update({
                where: {
                    order_id: orderId,
                },
                data: {
                    status: orders_status.DELIVERY_FAILED,
                    payment_status: refundState.orderPaymentStatus,
                    employee_id: employeeId,
                },
            });
        });
        return { order: updatedOrder };
    }
    const updateOrder = await update(orderId, {
        status: orders_status.DELIVERY_FAILED,
        employee_id: employeeId,
    });
    return { order: updateOrder };
};
export const handleVnpayReturnService = async (query, ipAddr = "127.0.0.1") => {
    const isValidSignature = verifyVnpayReturn(query);
    if (!isValidSignature) {
        throw new AppError("Chữ ký VNPay không hợp lệ.", 400);
    }
    const paymentTxnRef = String(query.vnp_TxnRef || "");
    const responseCode = String(query.vnp_ResponseCode || "");
    const transactionStatus = String(query.vnp_TransactionStatus || "");
    const transactionCode = String(query.vnp_TransactionNo || "");
    const paidAmount = Number(query.vnp_Amount || 0) / 100;
    const paidAt = parseVnpayDate(String(query.vnp_PayDate || ""));
    if (!paymentTxnRef) {
        throw new AppError("Thiếu mã đơn hàng từ VNPay.", 400);
    }
    const isPaymentSuccess = responseCode === "00" && transactionStatus === "00";
    const result = await prisma.$transaction(async (tx) => {
        const paymentTransaction = await tx.payment_transactions.findUnique({
            where: {
                transaction_id: paymentTxnRef,
            },
        });
        if (!paymentTransaction || paymentTransaction.payment_method !== "VNPAY") {
            throw new AppError("Không tìm thấy giao dịch thanh toán.", 404);
        }
        const order = await tx.orders.findUnique({
            where: {
                order_id: paymentTransaction.order_id,
            },
        });
        if (!order) {
            throw new AppError("Không tìm thấy dơn hàng.", 404);
        }
        if (order.payment_method !== "VNPAY") {
            throw new AppError("Đơn hàng không sử dụng VNPay.", 400);
        }
        if ([
            PAYMENT_TRANSACTION_REFUND_PENDING,
            payment_transactions_status.REFUNDED,
            PAYMENT_TRANSACTION_REFUND_FAILED,
        ].includes(paymentTransaction.status)) {
            return {
                order,
                paymentTransaction,
                paymentStatus: paymentTransaction.status,
                alreadyProcessed: true,
            };
        }
        if (paymentTransaction.status === payment_transactions_status.SUCCESS) {
            return {
                order,
                paymentTransaction,
                paymentStatus: order.status === orders_status.CANCELLED
                    ? "PAID_AFTER_EXPIRED"
                    : "PAID",
                alreadyProcessed: true,
                needManualRefund: order.status === orders_status.CANCELLED,
            };
        }
        if (order.status === orders_status.CANCELLED) {
            if (isPaymentSuccess) {
                const updatedPaymentTransaction = await tx.payment_transactions.update({
                    where: {
                        transaction_id: paymentTransaction.transaction_id,
                    },
                    data: {
                        status: payment_transactions_status.SUCCESS,
                        transaction_code: transactionCode || null,
                        provider_response: JSON.stringify(query),
                        paid_at: paidAt,
                        updated_at: new Date(),
                    },
                });
                return {
                    order,
                    paymentTransaction: updatedPaymentTransaction,
                    paymentStatus: "PAID_AFTER_EXPIRED",
                    alreadyProcessed: false,
                    needRefund: true,
                    message: "Đơn đã hết hạn nhưng VNPay báo đã thanh toán, cần hoàn tiền.",
                };
            }
            return {
                order,
                paymentTransaction,
                paymentStatus: "EXPIRED",
                alreadyProcessed: true,
                message: "Đơn hàng đã hết hạn thanh toán.",
            };
        }
        if (isPaymentSuccess && Number(order.total_price) !== paidAmount) {
            const updatedPaymentTransaction = await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.SUCCESS,
                    transaction_code: transactionCode || null,
                    provider_response: JSON.stringify(query),
                    paid_at: paidAt,
                    updated_at: new Date(),
                },
            });
            const updatedOrder = await tx.orders.update({
                where: {
                    order_id: order.order_id,
                },
                data: {
                    payment_status: orders_payment_status.PAID,
                    status: orders_status.CANCELLED,
                },
            });
            return {
                order: updatedOrder,
                paymentTransaction: updatedPaymentTransaction,
                paymentStatus: "PAID_AMOUNT_MISMATCH",
                alreadyProcessed: false,
                needRefund: true,
                message: "Số tiền thanh toán không khớp.",
            };
        }
        if (isPaymentSuccess) {
            const updatedPaymentTransaction = await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.SUCCESS,
                    transaction_code: transactionCode || null,
                    provider_response: JSON.stringify(query),
                    paid_at: paidAt,
                    updated_at: new Date(),
                },
            });
            const updateOrder = await tx.orders.update({
                where: {
                    order_id: order.order_id,
                },
                data: {
                    payment_status: orders_payment_status.PAID,
                },
            });
            return {
                order: updateOrder,
                paymentTransaction: updatedPaymentTransaction,
                paymentStatus: "PAID",
                alreadyProcessed: false,
            };
        }
        const updatedPaymentTransaction = await tx.payment_transactions.update({
            where: {
                transaction_id: paymentTransaction.transaction_id,
            },
            data: {
                status: payment_transactions_status.FAILED,
                transaction_code: transactionCode || null,
                provider_response: JSON.stringify(query),
                updated_at: new Date(),
            },
        });
        const updateOrder = await tx.orders.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                payment_status: orders_payment_status.FAILED,
                status: orders_status.CANCELLED
            },
        });
        return {
            order: updateOrder,
            paymentTransaction: updatedPaymentTransaction,
            paymentStatus: "FAILED",
            alreadyProcessed: false,
        };
    });
    if (["PAID_AFTER_EXPIRED", "PAID_AMOUNT_MISMATCH"].includes(result.paymentStatus)
        && !result.alreadyProcessed) {
        try {
            const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
                orderId: result.order.order_id,
                amount: paidAmount,
                userId: "SYSTEM",
                ipAddr,
            });
            const refundState = getVnpayRefundState(refundResult);
            const { refundedOrder, updatedPaymentTransaction } = await prisma.$transaction(async (tx) => {
                const updatedPaymentTransaction = await tx.payment_transactions.update({
                    where: {
                        transaction_id: paymentTransaction.transaction_id,
                    },
                    data: {
                        status: refundState.transactionStatus,
                        provider_response: JSON.stringify({
                            paymentReturn: query,
                            refund: refundResult,
                        }),
                        updated_at: new Date(),
                    },
                });
                const refundedOrder = await tx.orders.update({
                    where: {
                        order_id: result.order.order_id,
                    },
                    data: {
                        payment_status: refundState.orderPaymentStatus,
                    },
                });
                return { refundedOrder, updatedPaymentTransaction };
            });
            return {
                order: refundedOrder,
                paymentTransaction: updatedPaymentTransaction,
                paymentStatus: result.paymentStatus === "PAID_AMOUNT_MISMATCH"
                    ? `${refundState.paymentStatus}_AMOUNT_MISMATCH`
                    : `${refundState.paymentStatus}_AFTER_EXPIRED`,
                alreadyProcessed: false,
                refundResult,
                message: refundState.message,
            };
        }
        catch (error) {
            const needRefundOrder = await prisma.orders.update({
                where: {
                    order_id: result.order.order_id,
                },
                data: {
                    payment_status: orders_payment_status.PAID,
                },
            });
            return {
                order: needRefundOrder,
                paymentTransaction: result.paymentTransaction,
                paymentStatus: result.paymentStatus,
                alreadyProcessed: false,
                needManualRefund: true,
                refundError: error?.message,
                message: "Giao dịch VNPay đã thu tiền nhưng hoàn tiền tự động thất bại, cần admin xử lý thủ công.",
            };
        }
    }
    return result;
};
export const handleVnpayIpnService = async (query, ipAddr = "127.0.0.1") => {
    const isValidSignature = verifyVnpayReturn(query);
    if (!isValidSignature) {
        return {
            RspCode: "97",
            Message: "Invalid Checksum",
        };
    }
    const paymentTxnRef = String(query.vnp_TxnRef || "");
    const responseCode = String(query.vnp_ResponseCode || "");
    const transactionStatus = String(query.vnp_TransactionStatus || "");
    const transactionCode = String(query.vnp_TransactionNo || "");
    const paidAmount = Number(query.vnp_Amount || 0) / 100;
    const paidAt = parseVnpayDate(String(query.vnp_PayDate || ""));
    if (!paymentTxnRef) {
        return {
            RspCode: "01",
            Message: "Order not Found",
        };
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const paymentTransaction = await tx.payment_transactions.findUnique({
                where: {
                    transaction_id: paymentTxnRef,
                },
            });
            if (!paymentTransaction || paymentTransaction.payment_method !== "VNPAY") {
                return {
                    RspCode: "01",
                    Message: "Order not Found",
                };
            }
            const order = await tx.orders.findUnique({
                where: {
                    order_id: paymentTransaction.order_id,
                },
            });
            if (!order || order.payment_method !== "VNPAY") {
                return {
                    RspCode: "01",
                    Message: "Order not Found",
                };
            }
            const confirmedPaymentStatuses = new Set([
                payment_transactions_status.SUCCESS,
                PAYMENT_TRANSACTION_REFUND_PENDING,
                payment_transactions_status.REFUNDED,
                PAYMENT_TRANSACTION_REFUND_FAILED,
            ]);
            if (confirmedPaymentStatuses.has(paymentTransaction.status)) {
                return {
                    RspCode: "02",
                    Message: "Order already confirmed",
                };
            }
            if (Number(order.total_price) !== paidAmount) {
                return {
                    RspCode: "04",
                    Message: "Invalid amount",
                };
            }
            const isPaymentSuccess = responseCode === "00" && transactionStatus === "00";
            if (isPaymentSuccess) {
                await tx.payment_transactions.update({
                    where: {
                        transaction_id: paymentTransaction.transaction_id,
                    },
                    data: {
                        status: payment_transactions_status.SUCCESS,
                        transaction_code: transactionCode || null,
                        provider_response: JSON.stringify(query),
                        paid_at: paidAt,
                        updated_at: new Date(),
                    },
                });
                if (order.status === orders_status.CANCELLED) {
                    return {
                        RspCode: "00",
                        Message: "Confirm Success",
                        needRefund: true,
                        orderId: order.order_id,
                    };
                }
                const updatedOrder = await tx.orders.update({
                    where: {
                        order_id: order.order_id,
                    },
                    data: {
                        payment_status: orders_payment_status.PAID,
                    },
                });
                return {
                    RspCode: "00",
                    Message: "Confirm Success",
                    order: updatedOrder,
                };
            }
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.FAILED,
                    transaction_code: transactionCode || null,
                    provider_response: JSON.stringify(query),
                    updated_at: new Date(),
                },
            });
            const updatedOrder = await tx.orders.update({
                where: {
                    order_id: order.order_id,
                },
                data: {
                    payment_status: orders_payment_status.FAILED,
                    status: orders_status.CANCELLED,
                },
            });
            return {
                RspCode: "00",
                Message: "Confirm Success",
                order: updatedOrder,
            };
        });
        if ("needRefund" in result && result.needRefund) {
            try {
                const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
                    orderId: result.orderId,
                    amount: paidAmount,
                    userId: "SYSTEM",
                    ipAddr: ipAddr,
                });
                const refundState = getVnpayRefundState(refundResult);
                let updatedOrder = null;
                await prisma.$transaction(async (tx) => {
                    await tx.payment_transactions.update({
                        where: {
                            transaction_id: paymentTransaction.transaction_id,
                        },
                        data: {
                            status: refundState.transactionStatus,
                            provider_response: JSON.stringify({
                                paymentIpn: query,
                                refund: refundResult,
                            }),
                            updated_at: new Date(),
                        },
                    });
                    updatedOrder = await tx.orders.update({
                        where: {
                            order_id: result.orderId,
                        },
                        data: {
                            payment_status: refundState.orderPaymentStatus,
                        },
                    });
                });
                return {
                    RspCode: "00",
                    Message: "Confirm Success",
                    order: updatedOrder,
                };
            }
            catch (error) {
                const updatedOrder = await prisma.orders.update({
                    where: {
                        order_id: result.orderId,
                    },
                    data: {
                        payment_status: orders_payment_status.PAID,
                    },
                });
                return {
                    RspCode: "00",
                    Message: "Confirm Success",
                    order: updatedOrder,
                };
            }
        }
        return result;
    }
    catch (error) {
        return {
            RspCode: "99",
            Message: "Unknown error",
        };
    }
};
export const retryPaymentService = async (userId, orderId, ipAddr) => {
    return prisma.$transaction(async (tx) => {
        const order = await tx.orders.findFirst({
            where: {
                order_id: orderId,
                user_id: userId,
            },
            include: {
                orders_details: {
                    include: {
                        devices: true,
                    },
                },
            },
        });
        if (!order)
            throw new AppError("Không tìm thấy đơn hàng.", 404);
        if (order.payment_method !== "VNPAY") {
            throw new AppError("Chưa áp dụng cho các phương thức khác VNPay.", 400);
        }
        if (order.payment_status === orders_payment_status.PAID) {
            throw new AppError("Đơn hàng đã được thanh toán.", 400);
        }
        if ([
            ORDER_PAYMENT_REFUND_PENDING,
            orders_payment_status.REFUNDED,
            ORDER_PAYMENT_REFUND_FAILED,
        ].includes(order.payment_status)) {
            throw new AppError("Đơn hàng đã được hoàn tiền, kh6ong thể thanh toán lại.", 400);
        }
        if (order.status !== orders_status.PENDING) {
            throw new AppError("Đơn hàng đã hết hạn hoặc không còn ở trạng thái chờ thanh toán.", 400);
        }
        const orderExpireAt = new Date(new Date(order.order_date).getTime() + 15 * 60 * 1000);
        if (orderExpireAt <= new Date()) {
            throw new AppError("Đơn hàng đã hết thởi gian thanh toán, vui lòng đặt lại đơn mới.", 400);
        }
        const hasReserveDevices = order.orders_details.every((detail) => {
            const reservedDeviceCount = detail.devices.filter((device) => {
                return device.status === devices_status.RESERVED;
            }).length;
            return reservedDeviceCount >= Number(detail.quantity);
        });
        if (!hasReserveDevices) {
            throw new AppError("Sản phẩm trong đơn không còn được giữ hàng, vui lòng đặt lại đơn mới.", 400);
        }
        await tx.payment_transactions.updateMany({
            where: {
                order_id: orderId,
                payment_method: "VNPAY",
                status: payment_transactions_status.PENDING,
            },
            data: {
                status: payment_transactions_status.FAILED,
                updated_at: new Date(),
            },
        });
        const paymentTransaction = await tx.payment_transactions.create({
            data: {
                transaction_id: crypto.randomUUID(),
                order_id: orderId,
                payment_method: "VNPAY",
                amount: order.total_price,
                status: payment_transactions_status.PENDING,
                provider: "VNPAY",
            },
        });
        await tx.orders.update({
            where: {
                order_id: orderId,
            },
            data: {
                payment_status: orders_payment_status.PENDING,
            },
        });
        const paymentUrl = createVnpayPaymentUrl({
            txnRef: paymentTransaction.transaction_id,
            orderId,
            amount: Number(order.total_price),
            ipAddr,
            expireAt: orderExpireAt,
        });
        return {
            order,
            paymentTransaction,
            paymentUrl,
            expiredAt: orderExpireAt,
        };
    });
};
export const checkoutBuyNowRequest = async (userId, request, ipAddr) => {
    const user = await findUserById(userId);
    if (!user)
        throw new AppError("Không tìm thấy thông tin người dùng.", 404);
    return prisma.$transaction(async (tx) => {
        const address = await tx.addresses.findFirst({
            where: {
                address_id: request.addressId,
                user_id: userId,
            },
        });
        if (!address)
            throw new AppError("Địa chỉ giao hàng không tồn tại.", 404);
        const variant = await tx.product_variants.findUnique({
            where: {
                variant_id: request.variantId,
            },
            include: {
                products: {
                    include: {
                        products_promotions: {
                            include: {
                                promotions: true,
                            },
                        },
                    },
                },
            },
        });
        if (!variant)
            throw new AppError("Biến thể sản phẩm không tồn tại.", 404);
        const availableQuantity = getAvailableQuantity(variant);
        if (request.quantity > availableQuantity) {
            throw new AppError(`Chỉ còn ${availableQuantity} sản phẩm trong kho.`, 400);
        }
        const availableDeviceCount = await tx.devices.count({
            where: {
                variant_id: request.variantId,
                status: devices_status.AVAILABLE,
            },
        });
        if (availableDeviceCount < request.quantity) {
            throw new AppError(`SKU ${variant.sku} không đủ thiết bị khả dụng.`, 400);
        }
        const itemPrice = calculatePrice(variant);
        const totalPrice = itemPrice * request.quantity;
        const orderId = crypto.randomUUID();
        const orderDetailId = crypto.randomUUID();
        const paymentStatus = request.paymentMethod === "COD"
            ? orders_payment_status.UNPAID
            : orders_payment_status.PENDING;
        const order = await tx.orders.create({
            data: {
                order_id: orderId,
                user_id: userId,
                address_id: address.address_id,
                total_price: totalPrice,
                status: orders_status.PENDING,
                payment_method: request.paymentMethod,
                payment_status: paymentStatus,
                receiver_name: address.receiver_name,
                receiver_phone: address.phone_number,
            },
        });
        await tx.orders_details.create({
            data: {
                order_detail_id: orderDetailId,
                order_id: orderId,
                variant_id: request.variantId,
                quantity: request.quantity,
                price: itemPrice,
            },
        });
        const devices = await tx.devices.findMany({
            where: {
                variant_id: request.variantId,
                status: devices_status.AVAILABLE,
            },
            take: request.quantity,
            orderBy: {
                device_id: "asc",
            },
        });
        if (devices.length < request.quantity) {
            throw new AppError("Không đủ thiết bị khả dụng để giữ hàng.", 400);
        }
        const updated = await tx.devices.updateMany({
            where: {
                device_id: {
                    in: devices.map((device) => device.device_id),
                },
                status: devices_status.AVAILABLE,
            },
            data: {
                status: devices_status.RESERVED,
                order_detail_id: orderDetailId,
            },
        });
        if (updated.count !== request.quantity) {
            throw new AppError("Thiết bị vừa được giữ bởi đơn hàng khác, vui lòng thử lại.", 409);
        }
        const paymentTransaction = await tx.payment_transactions.create({
            data: {
                transaction_id: crypto.randomUUID(),
                order_id: orderId,
                payment_method: request.paymentMethod,
                amount: totalPrice,
                status: payment_transactions_status.PENDING,
                provider: request.paymentMethod,
            },
        });
        const paymentUrl = request.paymentMethod === "VNPAY"
            ? createVnpayPaymentUrl({
                txnRef: paymentTransaction.transaction_id,
                orderId,
                amount: totalPrice,
                ipAddr,
            })
            : null;
        return { order, paymentUrl };
    });
};
