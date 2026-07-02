import type { ListMeta, ListQuery } from "./admin-table.type";
import type { Brand } from "./brand.type";
import type { Category } from "./category.type";

export type ProductLineSortBy = "line_name" | "display_order" | "created_at";

export type ProductLine = {
    line_id: string;
    line_name: string;
    normalized_name: string;
    slug: string;
    brand_id: string;
    category_id: string;
    description?: string | null;
    image_url?: string | null;
    display_order: number;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    brands?: Brand;
    categories?: Category;
    _count?: {
        products: number;
    };
};

export type ProductLineListQuery = ListQuery<ProductLineSortBy> & {
    brandId?: string;
    categoryId?: string;
    isActive?: boolean;
};

export type ProductLineListData = {
    productLines: ProductLine[];
    meta: ListMeta<ProductLineSortBy>;
};

export type ProductLineDetailData = {
    productLine: ProductLine;
};

export type ProductLinePayload = {
    lineName: string;
    brandId: string;
    categoryId: string;
    description?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
    isActive?: boolean;
};
