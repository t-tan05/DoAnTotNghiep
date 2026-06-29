export type WishlistItem = {
    wishlist_id: string;
    user_id: string;
    variant_id: string;
    created_at: string;
    product_variants: {
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
};

export type WishlistResponse = {
    wishlists: WishlistItem[];
    meta: {
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    };
};

export type WishlistCheckResponse = {
    isWishlisted: boolean;
};

export type WishlistCheckManyResponse = {
    items: Record<string, boolean>;
};

export type WishlistMutationResponse = {
    wishlist?: WishlistItem;
    isWishlisted: boolean;
};
