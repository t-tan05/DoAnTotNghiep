import type { CreateReviewPayload, ProductReviewsResponse } from "@/types/review.type";
import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";

export const reviewService = {
    create: async(payload: CreateReviewPayload) => {
        const res = await api.post<BackendSuccess<{review: unknown}>>("/reviews", payload);
        return res.data.data;
    },

    getByProduct: async(productId: string, page = 1, limit = 5, rating?: number) => {
        const res = await api.get<BackendSuccess<ProductReviewsResponse>>(
            `/reviews/products/${productId}`,
            {
                params: {
                    page,
                    limit,
                    rating,
                },
            },
        );

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách đánh giá.");
        }

        return res.data.data;
    },
};