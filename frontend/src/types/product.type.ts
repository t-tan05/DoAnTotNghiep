import type { ListMeta, ListQuery } from "./admin-table.type";
import type { AdminProductVariant } from "./productVariant.type";

export type ProductSortBy = "product_name" | "created_at" | "warranty_period";

export type ProductListQuery = ListQuery<ProductSortBy> & {
    brandId?: string;
    categoryId?: string;
};

export type AdminProduct = {
    product_id: string;
    product_name: string;
    description?: string | null;
    warranty_period: number;
    created_at?: string | null;
    brands: {
        brand_id: string;
        brand_name: string;
    };
    categories: {
        category_id: string;
        category_name: string;
    };
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
    description?: string | null;
    warrantyPeriod: number;
};

export type UpdateProductPayload = {
    productName?: string;
    brandId?: string;
    categoryId?: string;
    description?: string | null;
    warrantyPeriod?: number;
};
