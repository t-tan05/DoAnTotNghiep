import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";
import type {
    CheckoutPayload,
    CheckoutResponse,
    MyOrder,
    MyOrdersResponse,
    VnpayReturnResponse,
    StaffOrder,
    StaffOrderDetailResponse,
    StaffOrderListQuery,
    StaffOrderListResponse,
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

    getAllForStaff: async(query: StaffOrderListQuery): Promise<StaffOrderListResponse> => {
        const res = await api.get<BackendSuccess<StaffOrderListResponse>>("/orders", {
            params: query,
        });

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách đơn hàng.");
        }

        return res.data.data;
    },

    getDetailForStaff: async(orderId: string): Promise<StaffOrderDetailResponse> => {
        const res = await api.get<BackendSuccess<StaffOrderDetailResponse>>(`/orders/${orderId}`);

        if(!res.data.data) {
            throw new Error("Không lấy được chi tiết đơn hàng.");
        }

        return res.data.data;
    },

    confirm: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: StaffOrder}>>(
            `/orders/${orderId}/confirm`
        );

        return res.data.data;
    },

    ship: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: StaffOrder}>> (
            `/orders/${orderId}/ship`
        );

        return res.data.data;
    },

    complete: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: StaffOrder}>> (
            `/orders/${orderId}/complete`
        );

        return res.data.data;
    },

    cancelForStaff: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: StaffOrder}>> (
            `/orders/${orderId}/cancel`
        );

        return res.data.data;
    },

    markDeliveryFailed: async(orderId: string) => {
        const res = await api.patch<BackendSuccess<{order: StaffOrder}>> (
            `/orders/${orderId}/delivery-failed`
        );

        return res.data.data;
    },
}
