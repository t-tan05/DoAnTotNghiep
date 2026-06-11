import type { ListMeta, ListQuery } from "./admin-table.type";

export type BrandSortBy = "brand_name";

export type Brand = {
    brand_id: string;
    brand_name: string;
    normalized_name: string;
    description?: string | null;
};

export type BrandListQuery = ListQuery<BrandSortBy>;

export type BrandListData = {
    brands: Brand[];
    meta: ListMeta<BrandSortBy>;
};

export type BrandPayload = {
    brandName: string;
    description?: string;
};