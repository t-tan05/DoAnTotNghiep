import Joi from "joi";
export const updateProductVariantSchema = Joi.object({
    sku: Joi.string()
        .trim()
        .optional()
        .messages({
        "string.empty": "Mã sku không được để trống",
    }),
    price: Joi.number()
        .positive()
        .optional()
        .messages({
        "number.positive": "Giá phải lớn hơn 0",
    }),
    quantityInStock: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.integer": "Số lượng tồn kho phải là số nguyên",
        "number.min": "Số lượng tồn kho phải lớn hơn hoặc bằng 0",
        "any.required": "Số lượng tồn kho là bắt buộc"
    }),
    attributeValueIds: Joi.array()
        .items(Joi.string()
        .trim()
        .required()
        .messages({
        "any.required": "Mã giá trị thuộc tính là bắt buộc",
    }))
        .min(1)
        .optional(),
    specs: Joi.array()
        .items(Joi.object({
        specKey: Joi.string()
            .trim()
            .required()
            .messages({
            "string.empty": "Khóa thông số kỹ thuật không được để trống",
            "any.required": "Khóa thông số kỹ thuật là bắt buộc",
        }),
        specValue: Joi.string()
            .trim()
            .required()
            .messages({
            "string.empty": "Giá trị thông số kỹ thuật không được để trống",
            "any.required": "Giá trị thông số kỹ thuật là bắt buộc",
        }),
    }))
        .optional()
});
