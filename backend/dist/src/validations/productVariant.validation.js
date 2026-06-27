import Joi from "joi";
export const createProductVariantSchema = Joi.object({
    variants: Joi.array()
        .items(Joi.object({
        sku: Joi.string()
            .trim()
            .uppercase()
            .max(100)
            .required()
            .messages({
            "string.empty": "Mã SKU không được để trống.",
            "string.max": "Mã SKU tối đa 100 ký tự.",
            "any.required": "Mã SKU là bắt buộc."
        }),
        variantName: Joi.string()
            .trim()
            .max(255)
            .allow("", null)
            .optional(),
        detailDescription: Joi.string()
            .trim()
            .allow(null)
            .optional(),
        price: Joi.number()
            .positive()
            .required()
            .messages({
            "number.positive": "Giá sản phẩm phải lớn hơn 0.",
            "any.required": "Giá sản phẩm là bắt buộc.",
        }),
        quantityInStock: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
            "number.integer": "Số lượng sản phẩm trong kho phải là số nguyên.",
            "number.min": "Số lượng sản phẩm trong kho không được nhỏ hơn 0.",
            "any.required": "Số lượng sản phẩm trong kho là bắt buộc.",
        }),
        attributeValueIds: Joi.array()
            .items(Joi.string().trim().required())
            .default([]),
        specs: Joi.array()
            .items(Joi.object({
            specKey: Joi.string().trim().required(),
            specValue: Joi.string().trim().required(),
        }))
            .default([]),
    }))
        .min(1)
        .required(),
});
export const updateProductVariantSchema = Joi.object({
    sku: Joi.string()
        .trim()
        .optional()
        .messages({
        "string.empty": "Mã sku không được để trống",
    }),
    variantName: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional(),
    detailDescription: Joi.string()
        .trim()
        .allow(null)
        .optional(),
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
    stockNote: Joi.string()
        .trim()
        .allow("", null)
        .optional(),
    attributeValueIds: Joi.array()
        .items(Joi.string()
        .trim()
        .required()
        .messages({
        "any.required": "Mã giá trị thuộc tính là bắt buộc",
    }))
        .default([])
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
}).min(1).with("stockNote", "quantityInStock");
