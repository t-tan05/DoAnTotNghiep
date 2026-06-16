import Joi from "joi";
export const addCartItemSchema = Joi.object({
    variantId: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng chọn sản phẩm.",
        "any.required": "Vui lòng chọn sản phẩm.",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "Số lượng không hợp lệ.",
        "number.integer": "Số lượng phải là số nguyên.",
        "number.min": "Số lượng tối thiểu là 1.",
        "any.required": "Vui lòng nhập số lượng.",
    }),
});
export const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "Số lượng không hợp lệ.",
        "number.integer": "Số lượng phải là số nguyên.",
        "number.min": "Số lượng tối thiểu là 1.",
        "any.required": "Vui lòng nhập số lượng.",
    }),
});
