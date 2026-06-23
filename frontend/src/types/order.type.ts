export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "ZALOPAY" | "BANK_TRANSFER";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERY_FAILED" | "COMPLETED" | "CANCELLED" | "RETURNED";
export type OrderPaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

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
