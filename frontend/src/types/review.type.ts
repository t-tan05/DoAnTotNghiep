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