import { cancelMyOrderService, checkoutOrderService, getMyOrderDetailService, getMyOrdersService, cancelOrderForStaffService, completeOrderService, confirmOrderService, getAllOrdersService, getOrderDetailForStaffService, markDeliveryFailedService, shipOrderService, handleVnpayReturnService, handleVnpayIpnService, } from "#services/order.service";
import { CatchAsync } from "#utils/CatchAsync";
import { orders_payment_method, orders_payment_status, orders_status, } from "@prisma/client";
const getEnumQuery = (value, values) => {
    return typeof value === "string" && values.includes(value)
        ? value
        : undefined;
};
export const checkoutOrderController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    const data = await checkoutOrderService(userId, req.body, ipAddr);
    res.status(201).json({
        success: true,
        message: "Đặt hàng thành công.",
        data: {
            ...data,
        },
    });
});
export const getMyOrdersController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const data = await getMyOrdersService(userId);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});
export const getMyOrderDetailController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const orderId = req.params.orderId;
    const data = await getMyOrderDetailService(userId, orderId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});
export const cancelMyOrderController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const orderId = req.params.orderId;
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    const data = await cancelMyOrderService(userId, orderId, ipAddr);
    res.status(200).json({
        success: true,
        message: "Hủy đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});
export const getAllOrdersController = CatchAsync(async (req, res) => {
    const data = await getAllOrdersService({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        status: getEnumQuery(req.query.status, Object.values(orders_status)),
        paymentStatus: getEnumQuery(req.query.paymentStatus, Object.values(orders_payment_status)),
        paymentMethod: getEnumQuery(req.query.paymentMethod, Object.values(orders_payment_method)),
        fromDate: typeof req.query.fromDate === "string" ? req.query.fromDate : undefined,
        toDate: typeof req.query.toDate === "string" ? req.query.toDate : undefined,
        sortBy: ["order_date", "total_price", "status"].includes(String(req.query.sortBy))
            ? req.query.sortBy
            : "order_date",
        sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
    });
    res.status(200).json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công.",
        data: {
            ...data
        },
    });
});
export const getOrderDetailForStaffController = CatchAsync(async (req, res) => {
    const data = await getOrderDetailForStaffService(req.params.orderId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công.",
        data: {
            ...data
        },
    });
});
export const confirmOrderController = CatchAsync(async (req, res) => {
    const data = await confirmOrderService(req.params.orderId, req.user.user_id);
    res.status(200).json({
        success: true,
        message: "Xác nhận đơn hàng thành công.",
        data: {
            ...data
        },
    });
});
export const shipOrderController = CatchAsync(async (req, res) => {
    const data = await shipOrderService(req.params.orderId, req.user.user_id);
    res.status(200).json({
        success: true,
        message: "Cập nhật đơn hàng sang đang giao thành công.",
        data: {
            ...data
        },
    });
});
export const completeOrderController = CatchAsync(async (req, res) => {
    const data = await completeOrderService(req.params.orderId, req.user.user_id);
    res.status(200).json({
        success: true,
        message: "Hoàn tất đơn hàng thành công.",
        data: {
            ...data
        },
    });
});
export const cancelOrderForStaffController = CatchAsync(async (req, res) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    const data = await cancelOrderForStaffService(req.params.orderId, req.user.user_id, ipAddr);
    res.status(200).json({
        success: true,
        message: "Hủy đơn hàng thành công.",
        data: {
            ...data
        },
    });
});
export const markDeliveryFailedController = CatchAsync(async (req, res) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    const data = await markDeliveryFailedService(req.params.orderId, req.user.user_id, ipAddr);
    res.status(200).json({
        success: true,
        message: "Cập nhật giao hàng thất bại thành công.",
        data: {
            ...data
        },
    });
});
export const vnpayReturnController = CatchAsync(async (req, res) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    const data = await handleVnpayReturnService(req.query, ipAddr);
    res.status(200).json({
        success: true,
        message: "Xử lý kết quả thanh toán VNPay thành công.",
        data: {
            ...data,
        },
    });
});
export const vnpayIpnController = async (req, res) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    try {
        const data = await handleVnpayIpnService(req.query, ipAddr);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(200).json({
            RspCode: "99",
            Message: "Unknown error",
        });
    }
};
