import Joi from "joi";
export const createProductAttributeSchema = Joi.object({
    attributes: Joi.array()
        .items(Joi.object({
        attributeName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
            "string.min": "Tên thuộc tính ít nhất 2 ký tự",
            "string.max": "Tên thuộc tính tối đa 50 ký tự",
            "any.required": "Tên thuộc tính là bắt buộc",
        }),
        displayOrder: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
            "number.integer": "Thứ tự hiển thị phải là số nguyên",
            "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0",
        }),
    }))
        .min(1)
        .required()
});
export const updateProductAtrributeSchema = Joi.object({
    attributeName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
        "string.min": "Tên thuộc tính ít nhất 2 ký tự",
        "string.max": "Tên thuộc tính tối đa 50 ký tự",
        "any.required": "Tên thuộc tính là bắt buộc",
    }),
    displayOrder: Joi.number()
        .integer()
        .min(0)
        .messages({
        "number.integer": "Thứ tự hiển thị phải là số nguyên",
        "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0",
    }),
});
