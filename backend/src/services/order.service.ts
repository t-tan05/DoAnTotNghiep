import prisma from "#config/prisma";
import type { 
    CheckoutOrderPayload, 
    OrderListQuery
} from "#types/order.type";
import AppError from "#utils/AppError";
import {
    devices_status,
    orders_payment_status,
    orders_status,
    payment_transactions_status,
} from "@prisma/client";
import crypto from "crypto";
import { 
    findMyOrders, 
    findOrderDetailForUser,
    findOrderDetailForStaff,
    getOrderWithQuery,
    findOrderById,
    update,
} from "#models/order.model";
import { createVnpayPaymentUrl, refundVnpayPayment, verifyVnpayReturn } from "./vnpay.service.js";

const getAvailableQuantity = (variant: any) => {
    return Number(variant.quantity_in_stock) - Number(variant.reserved_quantity ?? 0);
};

const parseVnpayDate = (value?: string) => {
    if(!value || value.length !== 14) return new Date();

    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(8, 10));
    const minute = Number(value.slice(10, 12));
    const second = Number(value.slice(12, 14));

    return new Date(year, month, day, hour, minute, second);
};

export const checkoutOrderService = async(
    userId: string,
    payload: CheckoutOrderPayload,
    ipAddr: string,
) => {
    return prisma.$transaction(async(tx) => {
        const address = await tx.addresses.findFirst({
            where: {
                address_id: payload.addressId,
                user_id: userId,
            },
        });

        if(!address) throw new AppError("Địa chỉ giao hàng không tồn tại.", 404);

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

        if(!cart || cart.carts_items.length === 0) {
            throw new AppError("Giỏ hàng đang trống.", 400);
        }

        //Duyệt qua từng sản phẩm trong cart_items
        for(const item of cart.carts_items) {
            const variant = item.product_variants;

            if(!variant) {
                throw new AppError("Sản phẩm trong giỏ hàng không tồn tại.", 404);
            }

            const availableQuantity = getAvailableQuantity(variant);

            if(item.quantity > availableQuantity) {
                throw new AppError(`Sản phẩm ${variant.sku} không đủ số lượng trong kho.`, 400);
            }

            const availableDeviceCount = await tx.devices.count({
                where: {
                    variant_id: item.variant_id,
                    status: devices_status.AVAILABLE,
                },
            });

            if(availableDeviceCount < item.quantity) {
                throw new AppError(`SKU ${variant.sku} không đủ thiết bị khả dụng.`, 400);
            }
        }

        //Tính tổng thanh toán
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

        for(const detail of orderDetails) {
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

            if(devices.length < detail.quantity) {
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

            if(updated.count !== detail.quantity) {
                throw new AppError("Thiết bị vừa được giữ bởi đơn hàng khác, vui lòng thử lại.", 409);
            }
        }

        await tx.payment_transactions.create({
            data: {
                transaction_id: crypto.randomUUID(),
                order_id: orderId,
                payment_method: payload.paymentMethod,
                amount: totalPrice,
                status: payment_transactions_status.PENDING,
                provider: payload.paymentMethod,
            },
        });

        //Thanh toán bằng vnpay
        const paymentUrl = payload.paymentMethod === "VNPAY"
            ? createVnpayPaymentUrl({
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

        return {order, paymentUrl};
    });
};

export const getMyOrdersService = async(userId: string) => {
    const orders = await findMyOrders(userId);

    return {orders};
}

export const getMyOrderDetailService = async(userId: string, orderId: string) => {
    const order = await findOrderDetailForUser(orderId, userId);

    if(!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }

    return {order};
};

const refundPaidVnpayOrder = async(params: {
    orderId: string;
    amount: number;
    userId: string;
    ipAddr: string;
}) => {
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

    if(!paymentTransaction) {
        throw new AppError("Không tìm thấy giao dịch VNPay đã thanh toán.", 404);
    }

    if(!paymentTransaction.transaction_code || !paymentTransaction.paid_at) {
        throw new AppError("Giao dịch VNPay thiếu thông tin để hoàn tiền.", 400);
    }

    const refundResult = await refundVnpayPayment({
        orderId: params.orderId,
        amount: params.amount,
        transactionCode: paymentTransaction.transaction_code,
        transactionDate: paymentTransaction.paid_at,
        createBy: params.userId,
        ipAddr: params.ipAddr,
    });

    if(refundResult.vnp_ResponseCode !== "00") {
        throw new AppError(
            refundResult.vnp_Message || "Hoàn tiền thất bại.",
            400
        );
    }

    return {
        paymentTransaction,
        refundResult,
    };
};

export const cancelMyOrderService = async(userId: string, orderId: string, ipAddr: string) => {

    //Cập nhật thêm index
    const order = await prisma.orders.findFirst({
        where: {
            order_id: orderId,
            user_id: userId,
        },
    });

    if(!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }

    if(order.status !== orders_status.PENDING) {
        throw new AppError("Chỉ có thể hủy đơn hàng đang chờ xử lý.", 400);
    }

    if(order.payment_status === orders_payment_status.PAID) {
        if(order.payment_method !== "VNPAY") {
            throw new AppError("Đơn đã thanh toán nhưng chưa hỗ trợ hoàn tiền cho phương thức này.", 400);
        }

        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId,
            ipAddr,
        });

        const updatedOrder = await prisma.$transaction(async(tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.REFUNDED,
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
                    payment_status: orders_payment_status.REFUNDED,
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

    return {order: updatedOrder};
};

export const getAllOrdersService = async(params: OrderListQuery) => {
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

export const getOrderDetailForStaffService = async(orderId: string) => {
    const order = await findOrderDetailForStaff(orderId);

    if(!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }

    return { order };
}

export const confirmOrderService = async(orderId: string, employeeId: string) => {
    const order = await findOrderById(orderId);

    if(!order) throw new AppError("Không tìm thấy đơn hàng.", 404);

    if(order.status !== orders_status.PENDING) {
        throw new AppError("Chỉ có thể xác nhận đơn hàng đang chờ xử lý.", 400);
    }

    if(order.payment_method !== "COD" && order.payment_status !== orders_payment_status.PAID) {
        throw new AppError("Đơn hàng thanh toán online chưa thanh toán thành công.", 400);
    }

    const updateOrder = await update(orderId, {
        status: orders_status.CONFIRMED,
        employee_id: employeeId,
    });

    return {order: updateOrder};
};

export const shipOrderService  = async(orderId: string, employeeId: string) => {
    const order = await findOrderById(orderId);

    if(!order) throw new AppError("Không tìm thấy đơn hàng.", 404);

    if(order.status !== orders_status.CONFIRMED) {
        throw new AppError("Chỉ có thể giao đơn hàng đã xác nhận.", 400);
    }

    const updateOrder = await update(orderId, {
        status: orders_status.SHIPPED,
        employee_id: employeeId,
    });

    return {order: updateOrder};
};

//Tạo hàm tính tháng cho warranty_end_date
const addMonth = (date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

export const completeOrderService = async(orderId: string, employeeId: string) => {
    return prisma.$transaction(async(tx) => {
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

        if(!order) {
            throw new AppError("Không tìm thấy đơn hàng.", 404);
        }

        if(order.status !== orders_status.SHIPPED) {
            throw new AppError("Chỉ có thể hoàn tất đơn hàng đang giao.", 400);
        }

        const soldDate = new Date();

        for(const detail of order.orders_details) {
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

            if(updated.count !== detail.quantity) {
                throw new AppError("Số lượng thiết bị giữ cho đơn hàng không khớp.", 409);
            }
        }

        const shouldMarkCodPaid = order.payment_method === "COD";

        if(shouldMarkCodPaid) {
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
                    : {}
                ),
            },
        });
        return {
            order: updateOrder,
        };
    });
};

export const cancelOrderForStaffService = async(orderId: string, employeeId: string, ipAddr: string) => {
    const order = await findOrderById(orderId);

    if(!order) throw new AppError("Không tìm thấy đơn hàng.", 404);

    const cannotCancelStatuses = new Set<orders_status>([
        orders_status.COMPLETED,
        orders_status.CANCELLED,
        orders_status.RETURNED,
    ]);

    if(cannotCancelStatuses.has(order.status)) {
        throw new AppError("Không thể hủy đơn hàng ở trạng thái hiện tại.", 400);
    }

    if(order.payment_status === orders_payment_status.PAID) {
        if(order.payment_method !== "VNPAY") {
            throw new AppError("Đơn đã thanh toán nhưng chưa hỗ trợ hoàn tiền cho phương thức này.", 400);
        }

        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId: employeeId,
            ipAddr,
        });

        const updatedOrder = await prisma.$transaction(async(tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.REFUNDED,
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
                    payment_status: orders_payment_status.REFUNDED,
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

    return {order: updateOrder};
}

export const markDeliveryFailedService = async(orderId: string, employeeId: string, ipAddr: string) => {
    const order = await findOrderById(orderId);

    if(!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
    }

    if(order.status !== orders_status.SHIPPED) {
        throw new AppError("Chỉ có thể đánh dấu giao hàng thất bại với đơn đang giao.", 400);
    }

    if(order.payment_status === orders_payment_status.PAID) {
        if(order.payment_method !== "VNPAY") {
            throw new AppError("Đơn hàng đã được thanh toán, tuy nhiên hiện tại hệ thống chưa hỗ trợ hoàn tiền đối với phương thức thanh toán này.", 400);
        }

        const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
            orderId,
            amount: Number(order.total_price),
            userId: employeeId,
            ipAddr,
        });

        const updatedOrder = await prisma.$transaction(async(tx) => {
            await tx.payment_transactions.update({
                where: {
                    transaction_id: paymentTransaction.transaction_id,
                },
                data: {
                    status: payment_transactions_status.REFUNDED,
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
                    payment_status: orders_payment_status.REFUNDED,
                    employee_id: employeeId,
                },
            });
        });

        return {order: updatedOrder};
    }

    const updateOrder = await update(orderId, {
        status: orders_status.DELIVERY_FAILED,
        employee_id: employeeId,
    });

    return {order: updateOrder};
}

export const handleVnpayReturnService = async(query: Record<string, any>, ipAddr = "127.0.0.1") => {
    const isValidSignature = verifyVnpayReturn(query);

    if(!isValidSignature) {
        throw new AppError("Chữ ký VNPay không hợp lệ.", 400);
    }

    const orderId = String(query.vnp_TxnRef || "");
    const responseCode = String(query.vnp_ResponseCode || "");
    const transactionStatus = String(query.vnp_TransactionStatus || "");
    const transactionCode = String(query.vnp_TransactionNo || "");
    const paidAmount = Number(query.vnp_Amount || 0) / 100;
    const paidAt = parseVnpayDate(String(query.vnp_PayDate || ""));

    if(!orderId) {
        throw new AppError("Thiếu mã đơn hàng từ VNPay.", 400);
    }

    const isPaymentSuccess = responseCode === "00" && transactionStatus === "00";

    const result = await prisma.$transaction(async(tx) => {
        const order = await tx.orders.findUnique({
            where: {
                order_id: orderId,
            },
        });

        if(!order) {
            throw new AppError("Không tìm thấy dơn hàng.", 404);
        }

        if(order.payment_method !== "VNPAY") {
            throw new AppError("Đơn hàng không sử dụng VNPay.", 400);
        }

        const paymentTransaction = await tx.payment_transactions.findFirst({
            where: {
                order_id: orderId,
                payment_method: "VNPAY",
            },
            orderBy: {
                created_at: "desc"
            },
        });

        if(!paymentTransaction) {
            throw new AppError("Không tìm thấy giao dịch thanh toán.", 404);
        }

        if(paymentTransaction.status === payment_transactions_status.REFUNDED) {
            return {
                order,
                paymentTransaction,
                paymentStatus: "REFUNDED",
                alreadyProcessed: true,
            };
        }

        if(paymentTransaction.status === payment_transactions_status.SUCCESS) {
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

        if(order.status === orders_status.CANCELLED) {
            if(isPaymentSuccess) {
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

        if(isPaymentSuccess && Number(order.total_price) !== paidAmount) {
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
                    order_id: orderId,
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

        if(isPaymentSuccess) {
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
                    order_id: orderId,
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
                order_id: orderId,
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

    if(
        ["PAID_AFTER_EXPIRED", "PAID_AMOUNT_MISMATCH"].includes(result.paymentStatus)
        && !result.alreadyProcessed
    ) {
        try {
            const { paymentTransaction, refundResult } = await refundPaidVnpayOrder({
                orderId,
                amount: paidAmount,
                userId: "SYSTEM",
                ipAddr,
            });

            const { refundedOrder, updatedPaymentTransaction } = await prisma.$transaction(async(tx) => {
                const updatedPaymentTransaction = await tx.payment_transactions.update({
                    where: {
                        transaction_id: paymentTransaction.transaction_id,
                    },
                    data: {
                        status: payment_transactions_status.REFUNDED,
                        provider_response: JSON.stringify({
                            paymentReturn: query,
                            refund: refundResult,
                        }),
                        updated_at: new Date(),
                    },
                });

                const refundedOrder = await tx.orders.update({
                    where: {
                        order_id: orderId,
                    },
                    data: {
                        payment_status: orders_payment_status.REFUNDED,
                    },
                });

                return {refundedOrder, updatedPaymentTransaction};
            });

            return {
                order: refundedOrder,
                paymentTransaction: updatedPaymentTransaction,
                paymentStatus: result.paymentStatus === "PAID_AMOUNT_MISMATCH"
                    ? "REFUNDED_AMOUNT_MISMATCH"
                    : "REFUNDED_AFTER_EXPIRED",
                alreadyProcessed: false,
                refundResult,
                message: "Giao dịch VNPay đã được ghi nhận và hệ thống đã tự động hoàn tiền.",
            };
        } catch(error: any) {
            const needRefundOrder = await prisma.orders.update({
                where: {
                    order_id: orderId,
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

export const handleVnpayIpnService = async(query: Record<string, any>) => {
    const isValidSignature = verifyVnpayReturn(query);

    if(!isValidSignature) {
        return {
            RspCode: "97",
            Message: "Invalid Checksum",
        };
    }

    const orderId = String(query.vnp_TxnRef || "");
    const responseCode = String(query.vnp_ResponseCode || "");
    const transactionStatus = String(query.vnp_TransactionStatus || "");
    const transactionCode = String(query.vnp_TransactionNo || "");
    const paidAmount = Number(query.vnp_Amount || 0) / 100;
    const paidAt = parseVnpayDate(String(query.vnp_PayDate || ""));

    if(!orderId) {
        return {
            RspCode: "01",
            Message: "Order not Found",
        };
    }

    try {
        return await prisma.$transaction(async(tx) => {
            const order = await tx.orders.findUnique({
                where: {
                    order_id: orderId,
                },
            });

            if(!order) {
                return {
                    RspCode: "01",
                    Message: "Order not Found",
                };
            }

            if(order.payment_method !== "VNPAY") {
                return {
                    RspCode: "01",
                    Message: "Order not Found",
                };
            }

            const paymentTransaction = await tx.payment_transactions.findFirst({
                where: {
                    order_id: orderId,
                    payment_method: "VNPAY",
                },
                orderBy: {
                    created_at: "desc",
                },
            });

            if(!paymentTransaction) {
                return {
                    RspCode: "01",
                    Message: "Order not Found",
                };
            }

            const confirmedPaymentStatuses = new Set<payment_transactions_status>([
                payment_transactions_status.SUCCESS,
                payment_transactions_status.REFUNDED,
            ]);

            if(confirmedPaymentStatuses.has(paymentTransaction.status)) {
                return {
                    RspCode: "02",
                    Message: "Order already confirmed",
                };
            }

            if(Number(order.total_price) != paidAmount) {
                return {
                    RspCode: "04",
                    Message: "Invalid amount",
                };
            }
            
            const isPaymentSuccess = responseCode === "00" && transactionStatus === "00";

            if(isPaymentSuccess) {
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

                await tx.orders.update({
                    where: {
                        order_id: orderId,
                    },
                    data: {
                        payment_status: orders_payment_status.PAID,
                    },
                });

                return {
                    RspCode: "00",
                    Message: "Confirm Success",
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

            await tx.orders.update({
                where: {
                    order_id: orderId,
                },
                data: {
                    payment_status: orders_payment_status.FAILED,
                    status: orders_status.CANCELLED,
                },
            });

            return {
                RspCode: "00",
                Message: "Confirm Success",
            };
        });
    }catch(error) {
        return {
            RspCode: "99",
            Message: "Unknown error",
        };
    }
};