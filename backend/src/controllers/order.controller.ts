import {
    cancelMyOrderService,
    checkoutOrderService,
    getMyOrderDetailService,
    getMyOrdersService,
    cancelOrderForStaffService,
    confirmOrderService,
    getAllOrdersService,
    getOrderDetailForStaffService,
    handleVnpayReturnService,
    handleVnpayIpnService,
    checkoutBuyNowRequest,
} from "#services/order.service";
import { CatchAsync } from "#utils/CatchAsync";
import {
    orders_payment_method,
    orders_payment_status,
    orders_status,
} from "@prisma/client";
import { Request, Response } from "express";
import { emitDashboardUpdate, getIO } from "../socket.js";

interface AuthRequest extends Request {
    user?: any;
}

const getEnumQuery = <T extends string>(value: unknown, values: T[]) => {
    return typeof value === "string" && values.includes(value as T)
        ? value as T
        : undefined;
};
const emitOrderUpdated = (order: any, eventType = "updated") => {
    const payload = {
        eventType,
        orderId: order.order_id,
        status: order.status,
        paymentStatus: order.payment_status,
        employeeId: order.employee_id,
        updatedAt: order.updated_at || new Date(),
    };

    getIO().to("admin").emit("order:updated", payload);
    if(order.user_id) {
        getIO().to(`user:${order.user_id}`).emit("order:updated", payload);
    }
    emitDashboardUpdate();
};

export const checkoutOrderController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";

    const data = await checkoutOrderService(userId, req.body, ipAddr);

    getIO().to("admin").emit("order:new", {
        orderId: data.order.order_id,
        status: data.order.status,
        paymentStatus: data.order.payment_status,
        totalPrice: data.order.total_price,
        createdAt: data.order.order_date,
    });
    emitDashboardUpdate();

    res.status(201).json({
        success: true,
        message: "Đặt hàng thành công.",
        data: {
            ...data,
        },
    });
});

export const buyNowOrderController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";

    const data = await checkoutBuyNowRequest(userId, req.body, ipAddr);

    getIO().to("admin").emit("order:new", {
        orderId: data.order.order_id,
        status: data.order.status,
        paymentStatus: data.order.payment_status,
        totalPrice: data.order.total_price,
        createdAt: data.order.order_date,
    });
    emitDashboardUpdate();

    res.status(201).json({
        success: true,
        message: "Đặt hàng thành công.",
        data: {
            ...data,
        },
    });
});

export const getMyOrdersController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;

    const tab = ["payment", "shipping", "completed", "cancelled"].includes(String(req.query.tab))
        ? String(req.query.tab) as "payment" | "shipping" | "completed" | "cancelled"
        : undefined;

    const data = await getMyOrdersService(userId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 5,
        tab,
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});

export const getMyOrderDetailController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    const orderId = req.params.orderId as string;

    const data = await getMyOrderDetailService(userId, orderId);

    res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});

export const cancelMyOrderController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    const orderId = req.params.orderId as string;
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";

    const data = await cancelMyOrderService(userId, orderId, ipAddr);

    emitOrderUpdated(data.order, "customer_cancelled");

    res.status(200).json({
        success: true,
        message: "Hủy đơn hàng thành công.",
        data: {
            ...data,
        },
    });
});

export const getAllOrdersController = CatchAsync(async(req: Request, res: Response) => {
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
            ? req.query.sortBy as any
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

export const getOrderDetailForStaffController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getOrderDetailForStaffService(req.params.orderId as string);

    res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công.",
        data: {
            ...data
        },
    });
});

export const confirmOrderController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const data = await confirmOrderService(req.params.orderId as string, req.user.user_id);

    emitOrderUpdated(data.order, "confirmed");

    res.status(200).json({
        success: true,
        message: "Xác nhận đơn hàng thành công.",
        data: {
            ...data
        },
    });
});

export const cancelOrderForStaffController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";

    const data = await cancelOrderForStaffService(req.params.orderId as string, req.user.user_id, ipAddr);

    emitOrderUpdated(data.order, "cancelled");

    res.status(200).json({
        success: true,
        message: "Hủy đơn hàng thành công.",
        data: {
            ...data
        },
    });
});

export const vnpayReturnController = CatchAsync(async(req: Request, res: Response) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";

    const data = await handleVnpayReturnService(req.query, ipAddr);

    if(data?.order) {
        emitOrderUpdated(data.order, "payment_updated");
    }

    res.status(200).json({
        success: true,
        message: "Xử lý kết quả thanh toán VNPay thành công.",
        data: {
            ...data,
        },
    });
});

export const vnpayIpnController = async(req: Request, res: Response) => {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0]
        || req.socket.remoteAddress
        || "127.0.0.1";
    try{
        const data = await handleVnpayIpnService(req.query, ipAddr);

        if("order" in data && data.order) {
            emitOrderUpdated(data.order, "payment_updated");
        }

        return res.status(200).json({
            RspCode: data.RspCode,
            Message: data.Message,
        });
    }catch(error) {
        return res.status(200).json({
            RspCode: "99",
            Message: "Unknown error",
        });
    }
};
