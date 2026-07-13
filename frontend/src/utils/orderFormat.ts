import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from "@/types/order.type";

export function getOrderStatusLabel(status: OrderStatus) {
    const map: Record<OrderStatus, string> = {
        PENDING: "Chờ xử lý",
        CONFIRMED: "Đã xác nhận",
        SHIPPED: "Đang giao",
        DELIVERY_FAILED: "Giao thất bại",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy",
        RETURNED: "Đã trả hàng",
    };

    return map[status] || status;
}

export function getPaymentStatusLabel(status: OrderPaymentStatus) {
    const map: Record<OrderPaymentStatus, string> = {
        UNPAID: "Chưa thanh toán",
        PENDING: "Chờ thanh toán",
        PAID: "Đã thanh toán",
        FAILED: "Thanh toán thất bại",
        REFUND_PENDING: "Đang hoàn tiền",
        REFUNDED: "Đã hoàn tiền",
        REFUND_FAILED: "Hoàn tiền thất bại",
    };

    return map[status] || status;
}

export function getPaymentMethodLabel(method: PaymentMethod) {
    const map: Record<PaymentMethod, string> = {
        COD: "Thanh toán khi nhận hàng",
        VNPAY: "VNPay",
        MOMO: "MoMo",
        ZALOPAY: "ZaloPay",
        BANK_TRANSFER: "Chuyển khoản",
    };

    return map[method] || method;
}

export function getGhnStatusLabel(status?: string | null) {
    if(!status) return "Chưa có thông tin";

    const map: Record<string, string> = {
        ready_to_pick: "Chờ GHN lấy hàng",
        picking: "GHN đang lấy hàng",
        picked: "GHN đã lấy hàng",
        storing: "Đang lưu kho",
        transporting: "Đang vận chuyển",
        sorting: "Đang phân loại",
        delivering: "Đang giao cho khách",
        delivered: "Giao thành công",
        delivery_fail: "Giao thất bại",
        waiting_to_return: "Chờ hoàn hàng",
        return: "Đang hoàn hàng",
        returned: "Đã hoàn hàng",
        cancel: "Đã hủy vận đơn",
        cancelled: "Đã hủy vận đơn",
    };

    return map[status] || status;
}
