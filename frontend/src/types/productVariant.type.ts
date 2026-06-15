import type { ProductVariantSpecPayload } from "./productVariantSpec.type";

export type AdminProductVariant = {
    variant_id: string;
    product_id?: string;
    sku: string;
    price: string | number;
    quantity_in_stock: number;
    reserved_quantity?: number;
    sold_quantity?: number;
    image_url?: string | null;
    public_id?: string | null;
    original_price?: number;
    discount_price?: number | null;
    active_promotion?: {
        promotion_id: string;
        promotion_name: string;
        discount_type: "PERCENT" | "FIXED";
        discount_value: string | number;
    } | null;
    product_images: Array<{
        image_id: number;
        image_url: string;
        is_default: boolean;
    }>;
    variant_attribute_values?: Array<{
        attribute_value_id: string;
        attribute_values: {
            attribute_value_id: string;
            value: string;
            product_attributes: {
                attribute_id: string;
                attribute_name: string;
            };
        };
    }>;
    product_variant_specs?: Array<{
        spec_key: string;
        spec_value: string;
        display_order?: number;
    }>;
};

export type CreateProductVariantPayload = {
    variants: Array<{
        sku: string;
        price: number;
        quantityInStock: number;
        attributeValueIds: string[];
        specs: ProductVariantSpecPayload[];
    }>;
};

export type UpdateProductVariantPayload = {
    sku?: string;
    price?: number;
    quantityInStock?: number;
    stockNote?: string | null;
    attributeValueIds?: string[];
    specs?: ProductVariantSpecPayload[];
};
