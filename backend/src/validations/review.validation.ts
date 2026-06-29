import Joi from "joi";

export const createReviewSchema = Joi.object({
    orderId: Joi.string()
        .required()
        .messages({
            "string.empty":"Thiếu mã đơn hàng.",
            "any.required":"Thiếu mã đơn hàng.",
        }),

    productId: Joi.string()
        .required()
        .messages({
            "string.empty":"Thiếu mã sản phẩm.",
            "any.required":"Thiếu mã sản phẩm.",
        }),

    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            "number.base": "Số sao không hợp lệ.",
            "number.integer": "Số sao phải là số nguyên.",
            "number.min": "Số sao tối thiểu là 1.",
            "number.max": "Số sao tối đa là 5.",
            "any.required": "Vui lòng chọn số sao.",
        }),

    comment: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
            "string.empty": "Vui lòng nhập nội dung đánh giá.",
            "string.min": "Vui lòng nhập nội dung đánh giá.",
            "string.max": "Nội dung đánh giá tối đa 1000 ký tự.",
            "any.required": "Vui lòng nhập nội dung đánh giá.",
        }),
})