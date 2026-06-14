import Joi from "joi";
export const createProductSchema = Joi.object({
    productName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
        "string.min": "Tên sản phẩm phải tối thiểu 2 ký tự",
        "string.max": "Tên sản phẩm tối đa 255 ký tự",
        "any.required": "Tên sản phẩm là bắt buộc",
    }),
    brandId: Joi.string().required(),
    categoryId: Joi.string().required(),
    description: Joi.string().allow("", null),
    warrantyPeriod: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
        "number.base": "Thời gian bảo hành phải là số",
        "number.min": "Thời gian bảo hành không được âm",
        "number.integer": "Thời gian bảo hành phải là số nguyên",
        "any.required": "Thời gian bảo hành là bắt buộc",
    }),
});
export const updateProductSchema = Joi.object({
    productName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional(),
    brandId: Joi.string().optional(),
    categoryId: Joi.string().optional(),
    description: Joi.string().allow("", null).optional(),
    warrantyPeriod: Joi.number()
        .integer()
        .min(0)
        .optional(),
}).min(1);
