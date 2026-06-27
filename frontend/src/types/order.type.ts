export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "ZALOPAY" | "BANK_TRANSFER";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERY_FAILED" | "COMPLETED" | "CANCELLED" | "RETURNED";
export type OrderPaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUND_PENDING" | "REFUNDED" | "REFUND_FAILED";

export type CheckoutPayload = {
    addressId: string;
    paymentMethod: PaymentMethod;
};

export type CheckoutResponse = {
    order: {
        order_id: string;
        total_price: number | string;
        status: string;
        payment_method: PaymentMethod;
        payment_status: string;
    };
    paymentUrl?: string | null;
};

export type VnpayReturnResponse = {
    order?: unknown;
    paymentTransaction?: unknown;
    paymentStatus: string;
    alreadyProcessed?: boolean;
    needRefund?: boolean;
    needManualRefund?: boolean;
    message?: string;
};

export type OrderProductImage = {
    image_id: number | string;
    image_url: string;
    is_default?: boolean | null;
};

export type OrderVariantAttribute = {
    attribute_values: {
        value: string;
        product_attributes: {
            attribute_name: string;
        };
    };
};

export type OrderDetail = {
    order_detail_id: string;
    order_id: string;
    variant_id: string;
    quantity: number;
    price: number | string;
    product_variants: {
       variant_id: string;
       sku?: string | null;
       variant_name?: string | null;
       image_url?: string | null;
        product_images?: OrderProductImage[];
        products: {
            product_id: string;
            product_name: string;
            warranty_period?: number;
        };
        variant_attribute_values?: OrderVariantAttribute[];
    };
};

export type MyOrder = {
    order_id: string;
    order_date: string;
    total_price: number | string;
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: OrderPaymentStatus;
    receiver_name?: string | null;
    receiver_phone?: string | null;
    orders_details: OrderDetail[];
};

export type MyOrdersResponse = {
    orders: MyOrder[];
};

export type StaffOrderListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus | "";
    paymentStatus?: OrderPaymentStatus | "";
    paymentMethod?: PaymentMethod | "";
    fromDate?: string;
    toDate?: string;
    sortBy?: "order_date" | "total_price" | "status";
    sortOrder?: "asc" | "desc";
};

export type StaffOrder = MyOrder & {
    users_orders_user_idTousers?: {
        user_id: string;
        name: string;
        email: string;
    };

    users_orders_employee_idTousers?: {
        user_id: string;
        name: string;
        email: string;
    } | null;

    addresses?: {
        address_id?: string;
        receiver_name?: string;
        receiver_phone?: string;
        address_line?: string;
        province?: string;
        district?: string;
        ward?: string;
    } | null;

    payment_transactions?: Array<{
        transaction_id: string;
        order_id: string;
        payment_method: PaymentMethod;
        amount: number | string;
        status: string;
        transaction_code?: string | null;
        provider_response?: string | null;
        paid_at?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
    }>;
};

export type StaffOrderListResponse = {
    orders: StaffOrder[];
    meta: {
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        }
    };
    sort: {
        sortBy: "order_date" | "total_price" | "status";
        sortOrder: "asc" | "desc";
    };
    filters: StaffOrderListQuery;
};

export type StaffOrderDetailResponse = {
    order: StaffOrder;
};