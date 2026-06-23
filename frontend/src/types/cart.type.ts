export type CartVariant = {
    variant_id: string;
    product_id: string;
    sku?: string | null;
    variant_name?: string | null;
    price: number | string;
    quantity_in_stock: number;
    reserved_quantity: number;
    image_url?: string | null;
    product_images?: Array<{
        image_id: number | string;
        image_url: string;
        is_default?: boolean | null;
    }>;
    products: {
        product_id: string;
        product_name: string;
        warranty_period: number;
        brands?: {
            brand_id: string;
            brand_name: string;
        };
        categories?: {
            category_id: string;
            category_name: string;
        };
    };
    variant_attribute_values?: Array<{
        attribute_values: {
            value: string;
            product_attributes: {
                attribute_name: string;
            };
        };
    }>;
};

export type CartItem = {
    cart_item_id: string;
    cart_id: string;
    variant_id: string;
    quantity: number;
    price_at_add: number | string;
    product_variants: CartVariant;
};

export type Cart = {
    cart_id: string;
    user_id: string;
    carts_items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
};

export type CartData = {
    cart: Cart;
};

export type AddCartItemPayload = {
    variantId: string;
    quantity: number;
};

export type UpdateCartItemPayload = {
    quantity: number;
};
