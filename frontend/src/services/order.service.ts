import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";
import type {
    CheckoutPayload,
    CheckoutResponse,
    MyOrder,
    MyOrdersResponse,
    VnpayReturnResponse,
} from "@/types/order.type";

export const orderService = {
    getMyOrders: async() => {
        const res = await api.get<BackendSuccess<MyOrdersResponse>>("/orders/me");
        return res.data.data;
    },

    checkout: async(payload: CheckoutPayload) => {
        const res = await api.post<BackendSuccess<CheckoutResponse>>("/orders/checkout", payload);
        return res.data.data;
    },

    handleVnpayReturn: async(search: string) => {
        const res = await api.get<BackendSuccess<VnpayReturnResponse>>(
            `/orders/payment/vnpay-return${search}`
        );
        return res.data.data;
    },

    cancelMyOrder: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: MyOrder}>>(
            `/orders/me/${orderId}/cancel`
        );
        return res.data.data;
    },

    retryPayment: async(orderId: string) => {
        const res = await api.post<BackendSuccess<{paymentUrl: string}>> (
            `/orders/me/${orderId}/retry-payment`
        );

        return res.data.data;
    },
}
