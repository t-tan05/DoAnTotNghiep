import type { ListMeta, ListQuery } from "./admin-table.type";
import type { AdminProductVariant } from "./productVariant.type";

export type ProductSortBy = "product_name" | "created_at" | "warranty_period";

export type ProductListQuery = ListQuery<ProductSortBy> & {
    brandId?: string;
    categoryId?: string;
    lineId?: string;
};

export type AdminProduct = {
    product_id: string;
    product_name: string;
    description?: string | null;
    warranty_period: number;
    created_at?: string | null;
    line_id?: string | null;
    brands: {
        brand_id: string;
        brand_name: string;
    };
    categories: {
        category_id: string;
        category_name: string;
    };
    product_lines?: {
        line_id: string;
        line_name: string;
        slug: string;
        brand_id?: string;
        category_id?: string;
    } | null;
    product_images?: Array<{
        image_id: number | string;
        image_url: string;
        is_default?: boolean | null;
    }>;
    product_variants: AdminProductVariant[];
};

export type ProductListData = {
    products: AdminProduct[];
    meta: ListMeta<ProductSortBy>;
};

export type ProductDetailData = {
    product: AdminProduct;
}

export type CreateProductPayload = {
    productName: string;
    brandId: string;
    categoryId: string;
    lineId?: string | null;
    description?: string | null;
    warrantyPeriod: number;
};

export type UpdateProductPayload = {
    productName?: string;
    brandId?: string;
    categoryId?: string;
    lineId?: string | null;
    description?: string | null;
    warrantyPeriod?: number;
};

export type PublicProductAttribute = {
    attribute_id: string;
    attribute_name: string;
    attribute_value_id: string;
    value: string;
};

export type PublicProductCardItem = {
    product_id: string;
    product_name: string;
    brand: {
        brand_id: string;
        brand_name: string;
    };
    category: {
        category_id: string;
        category_name: string;
    };
    variant_count?: number;
    color_options?: Array<{
        variant_id: string;
        image_url?: string | null;
        color?: string | null;
    }>;
    variant: {
        variant_id: string;
        sku: string;
        variant_name: string;
        price: number | string;
        original_price: number | string;
        discount_price?: number | string | null;
        quantity_in_stock: number;
        image_url?: string | null;
        attributes: PublicProductAttribute[];
        active_promotion?: {
            promotion_id: string;
            promotion_name: string;
            discount_type: "PERCENT" | "FIXED";
            discount_value: number | string;
        } | null;
    };
};

export type PublicProductFilterOption = {
    id: string;
    name: string;
};

export type PublicProductQuery = {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "newest" | "price_asc" | "price_desc" | "name_asc" | "promotion" | "best_selling";
};

export type PublicProductsResponse = {
    products: PublicProductCardItem[];
    filters: {
        brands: PublicProductFilterOption[];
        categories: PublicProductFilterOption[];
        maxPrice: number;
    };
    meta: {
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    };
};

export type RelatedProductsResponse = {
    products: PublicProductCardItem[];
};