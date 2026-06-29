import { createReviewService, getProductReviewsService, } from "#services/review.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createReviewController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const data = await createReviewService(userId, req.body);
    res.status(201).json({
        status: "success",
        message: "Đánh giá sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
export const getProductReviewsController = CatchAsync(async (req, res) => {
    const productId = req.params.productId;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 5);
    const rating = req.query.rating ? Number(req.query.rating) : undefined;
    const data = await getProductReviewsService(productId, page, limit, rating);
    res.status(200).json({
        status: "success",
        message: "Lấy danh sách đánh giá sản phẩm thành công.",
        data: {
            ...data
        },
    });
});
