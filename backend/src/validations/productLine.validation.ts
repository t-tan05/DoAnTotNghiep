import Joi from "joi";

export const createProductLineSchema = Joi.object({
    lineName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Vui lòng nhập tên dòng sản phẩm.",
            "string.min": "Tên dòng sản phẩm phải có ít nhất {#limit} ký tự.",
            "string.max": "Tên dòng sản phẩm không được vượt quá {#limit} ký tự.",
            "any.required": "Tên dòng sản phẩm là bắt buộc.",
        }),

    brandId: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Vui lòng chọn thương hiệu.",
            "any.required": "Thương hiệu là bắt buộc.",
        }),

    categoryId: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Vui lòng chọn danh mục.",
            "any.required": "Danh mục là bắt buộc.",
        }),

    description: Joi.string()
        .allow("", null)
        .optional(),

    imageUrl: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),

    displayOrder: Joi.number()
        .integer()
        .min(0)
        .optional(),

    isActive: Joi.boolean()
        .optional(),
});

export const updateProductLineSchema = Joi.object({
    lineName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    brandId: Joi.string()
        .trim()
        .optional(),

    categoryId: Joi.string()
        .trim()
        .optional(),

    description: Joi.string()
        .allow("", null)
        .optional(),

    imageUrl: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),

    displayOrder: Joi.number()
        .integer()
        .min(0)
        .optional(),

    isActive: Joi.boolean()
        .optional(),
});
