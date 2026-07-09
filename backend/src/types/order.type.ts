import type { 
    orders_payment_method,
    orders_payment_status,
    orders_status,
} from "@prisma/client";

export type MyOrderTab = "payment" | "shipping" | "completed" | "cancelled";

export type MyOrderListQuery = {
    page: number;
    limit: number;
    tab?: MyOrderTab;
};

export interface CheckoutOrderPayload {
    addressId: string;
    paymentMethod: orders_payment_method;
    note?: string;
}

export interface OrderListQuery {
    page: number;
    limit: number;
    search?: string;
    status?: orders_status;
    paymentStatus?: orders_payment_status;
    paymentMethod?: orders_payment_method;
    fromDate?: string;
    toDate?: string;
    sortBy: "order_date" | "total_price" | "status";
    sortOrder: "asc" | "desc";
}

export interface BuyNowRequest {
    variantId: string;
    addressId: string;
    quantity: number;
    paymentMethod: orders_payment_method;
    note?: string;
}
