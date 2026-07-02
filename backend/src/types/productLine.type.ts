import { ListQuery } from "#types/pagination.type";

export type ProductLineSortBy = "line_name" | "display_order" | "created_at";

export type ProductLineListQuery = ListQuery<ProductLineSortBy> & {
    brandId?: string;
    categoryId?: string;
    isActive?: boolean;
};

export type CreateProductLinePayload = {
    lineName: string;
    brandId: string;
    categoryId: string;
    description?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
    isActive?: boolean;
};

export type UpdateProductLinePayload = Partial<CreateProductLinePayload>;
