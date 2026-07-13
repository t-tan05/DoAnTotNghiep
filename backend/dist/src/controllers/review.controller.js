import { createReviewService, getAdminReviewsService, getProductReviewsService, } from "#services/review.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
const getDateQuery = (value) => {
    if (typeof value !== "string" || !value.trim())
        return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
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
export const getAdminReviewsController = CatchAsync(async (req, res) => {
    const rating = req.query.rating ? Number(req.query.rating) : undefined;
    const query = {
        ...parseListQuery({
            query: req.query,
            allowedSortFields: ["created_at", "rating", "product_name", "customer_name"],
            defaultSortBy: "created_at",
        }),
        rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
        productId: typeof req.query.productId === "string" ? req.query.productId : undefined,
        userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
        fromDate: getDateQuery(req.query.fromDate),
        toDate: getDateQuery(req.query.toDate),
    };
    const data = await getAdminReviewsService(query);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách đánh giá sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
