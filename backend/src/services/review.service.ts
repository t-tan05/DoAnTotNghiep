import { findOrderByReview } from "#models/order.model";
import { create, findReviewByOrderIdAndProductId, getProductReviewByProductId } from "#models/review.model";
import { CreateReviewPayload } from "#types/review.type";
import AppError from "#utils/AppError";
import { orders_status } from "@prisma/client";

export const createReviewService = async(userId: string, data: CreateReviewPayload) => {
    const { orderId, productId, rating, comment } = data;

    const order = await findOrderByReview(orderId, userId);

    if(!order) throw new AppError("Không tìm thấy đơn hàng.", 404);

    if(order.status !== orders_status.COMPLETED) {
        throw new AppError("Chỉ có t hể đánh giá khi đơn hàng đã hoàn thành.", 400);
    }

    const hasProductInOrder = order.orders_details.some((detail) => {
        return detail.product_variants.product_id === productId;
    });

    if(!hasProductInOrder) {
        throw new AppError("Sản phẩm không thuộc đơn hàng này.", 400);
    }

    const existedReview = await findReviewByOrderIdAndProductId(orderId, productId);

    if(existedReview) throw new AppError("Bạn đã đánh giá sản phẩm này trong đơn hàng.", 400);

    const review = await create({
        order_id: orderId,
        product_id: productId,
        user_id: userId,
        rating,
        comment: comment.trim(),
    });

    return [review];
}

export const getProductReviewsService = async(productId: string, page = 1, limit = 5, rating?: number) => {
    const [reviews, summary, ratingGroups, fillteredTotal] = await getProductReviewByProductId(productId, page, limit, rating);

    const totalReviews = summary._count.review_id;

    const ratingStats = [5, 4, 3, 2, 1].map((star) => {
        const found = ratingGroups.find((item) => item.rating === star);

        return {
            rating: star,
            count: found?._count.rating ?? 0,
        };
    });

    return {
        reviews,
        summary: {
            averageRating: Number(summary._avg.rating ?? 0),
            totalReviews,
            ratingStats,
        },
        meta: {
            page,
            limit,
            totalItems: fillteredTotal,
            totalPages: Math.ceil(fillteredTotal / limit),
        },
    };
};