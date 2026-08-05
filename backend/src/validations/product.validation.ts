import Joi from "joi";

export const createProductSchema = Joi.object({
    productName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            "string.empty": "Tên sản phẩm không được để trống.",
            "string.min": "Tên sản phẩm phải có ít nhất 2 ký tự.",
            "string.max":"Tên sản phẩm tối đa 255 ký tự.",
            "any.required":"Tên sản phẩm không được để trống.",
        }),
    
    brandId: Joi.string()
        .required()
        .messages({
            "string.empty": "Thương hiệu không được để trống.",
            "any.required": "Thương hiệu là bắt buộc.",
        }),

    categoryId: Joi.string()
        .required()
        .messages({
            "string.empty": "Danh mục không được để trống.",
            "any.required": "Danh mục là bắt buộc.",
        }),

    lineId: Joi.string()
        .allow(null)
        .optional()
        .messages({
            "string.empty": "Dòng sản phẩm không hợp lệ.",
        }),

    description: Joi.string()
        .allow("", null)
        .messages({
            "string.base": "Mô tả ko6ng hợp lệ.",
        }),

    warrantyPeriod: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base":"Thời gian bảo hành phải là số.",
            "number.min":"Thời gian bảo hành không được âm.",
            "number.integer":"Thời gian bảo hành phải là số nguyên.",
            "any.required":"Thời gian bảo hành không được để trống.",
        }),
});

export const updateProductSchema = Joi.object({
    productName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional()
        .messages({
            "string.empty": "Tên sản phẩm không được để trống.",
            "string.min": "Tên sản phẩm phải có ít nhất 2 ký tự.",
            "string.max": "Tên sản phẩm tối đa 255 ký tự.",
        }),

    brandId: Joi.string()
        .optional()
        .messages({
            "string.empty": "Thương hiệu không được để trống.",
        }),

    categoryId: Joi.string()
        .optional()
        .messages({
            "string.empty": "Danh mục không được để trống.",
        }),

    lineId: Joi.string()
        .allow(null)
        .optional()
        .messages({
            "string.empty": "Dòng sản phẩm không hợp lệ.",
        }),

    description: Joi.string()
        .allow("", null)
        .optional()
        .messages({
            "string.base": "Mô tả không hợp lệ.",
        }),

    warrantyPeriod: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base": "Thời gian bảo hành phải là số.",
            "number.integer": "Thời gian bảo hành phải là số nguyên.",
            "number.min": "Thời gian bảo hành không được nhỏ hơn 0 tháng.",
        }),
}).min(1).messages({
    "object.min": "Vui lòng cung cấp ít nhất một trường để cập nhật.",
});
