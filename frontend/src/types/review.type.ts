export type CreateReviewPayload = {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
};

export type ProductReview = {
    review_id: string;
    product_id: string;
    user_id: string;
    order_id: string;
    rating: number;
    comment: string;
    created_at: string;
    users?: {
        user_id: string;
        name: string;
    };
    review_images?: Array<{
        image_id: string;
        image_url: string;
    }>;
};

export type AdminReviewSortBy =
    | "created_at"
    | "rating"
    | "product_name"
    | "customer_name";

export type AdminReview = {
    review_id: string;
    product_id: string;
    user_id: string;
    order_id: string;
    rating: number;
    comment: string;
    created_at: string;
    users?: {
        user_id: string;
        name: string;
        email: string;
    };
    products?: {
        product_id: string;
        product_name: string;
    };
    orders?: {
        order_id: string;
        order_date: string;
        status: string;
    };
};

export type AdminReviewsQuery = {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: AdminReviewSortBy;
    sortOrder?: "asc" | "desc";
    rating?: number;
    productId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
};

export type AdminReviewsResponse = {
    reviews: AdminReview[];
    meta: {
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
        sort: {
            sortBy: AdminReviewSortBy;
            sortOrder: "asc" | "desc";
        };
        search?: string;
        filters: {
            rating?: number;
            productId?: string;
            userId?: string;
            fromDate?: string;
            toDate?: string;
        };
    };
};

export type ProductReviewSummary = {
    averageRating: number;
    totalReviews: number;
    ratingStats: Array<{
        rating: number;
        count: number;
    }>;
};

export type ProductReviewsResponse = {
    reviews: ProductReview[];
    summary: ProductReviewSummary;
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
};
