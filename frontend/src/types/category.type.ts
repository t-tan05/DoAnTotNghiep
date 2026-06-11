import type { ListMeta, ListQuery } from "./admin-table.type";

export type CategorySortBy = "category_name";

export type Category = {
    category_id: string;
    category_name: string;
    normalized_name: string;
    description?: string | null;
};

export type CategoryListQuery = ListQuery<CategorySortBy>;

export type CategoryListData = {
    categories: Category[];
    meta: ListMeta<CategorySortBy>;
};

export type CategoryPayload = {
    categoryName: string;
    description?: string;
}