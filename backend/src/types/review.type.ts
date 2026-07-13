import { ListQuery } from "./pagination.type.js";

export type CreateReviewPayload = {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
};

export type AdminReviewSortBy = 
    | "created_at"
    | "rating"
    | "product_name"
    | "customer_name";

export type AdminReviewListQuery = ListQuery<AdminReviewSortBy> & {
    rating?: number;
    productId?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
};