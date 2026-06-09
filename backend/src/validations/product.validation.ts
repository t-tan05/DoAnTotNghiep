import Joi from "joi";

export const createProductSchema = Joi.object({
    productName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            "string.min":"Tên sản phẩm phải tối thiểu 2 ký tự",
            "string.max":"Tên sản phẩm tối đa 255 ký tự",
            "any.required":"Tên sản phẩm là bắt buộc",
        }),
    
    brandId: Joi.string().required(),
    categoryId: Joi.string().required(),
    description: Joi.string().allow("", null),
    warrantyPeriod: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base":"Thời gian bảo hành phải là số",
            "number.min":"Thời gian bảo hành không được âm",
            "number.integer":"Thời gian bảo hành phải là số nguyên",
            "any.required":"Thời gian bảo hành là bắt buộc",
        }),

    variants: Joi.array()
        .items(
            Joi.object({
                sku: Joi.string()
                    .trim()
                    .uppercase()
                    .max(100)
                    .required()
                    .messages({
                        "string.max":"Mã sku tối đa 100 ký tự",
                        "string.empty":"Mã sku không được để trống",
                        "any.required":"Mã sku là bắt buộc",
                    }),

                price: Joi.number()
                    .positive()
                    .required()
                    .messages({
                        "number.base":"Giá sản phẩm phải là số",
                        "number.positive":"Giá sản phẩm phải lớn hơn 0",
                        "any.required":"Giá sản phẩm là bắt buộc",
                    }),

                quantityInStock : Joi.number()
                    .integer()
                    .min(0)
                    .required()
                    .messages({
                        "number.base":"Số lượng trong kho phải là số",
                        "number.integer":"Số lượng trong kho phải là số nguyên",
                        "number.min":"Số lượng trong kho phải lớn hơn hoặc bằng 0",
                        "any.requird":"Số lượng trong kho là bắt buộc",
                    }),

                attributeValueIds: Joi.array()
                    .items(
                        Joi.string()
                            .trim()
                            .required()

                    )
                    .default([]),

                specs: Joi.array()
                    .items(
                        Joi.object({
                            specKey: Joi.string()
                                .trim()
                                .required(),
                            specValue: Joi.string()
                                .trim()
                                .required()
                        })
                    )
                    .default([])
            })
        )
        .min(1)
        .required()
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
