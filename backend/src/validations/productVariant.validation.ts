import Joi from "joi";

export const createProductVariantSchema = Joi.object({
    variants: Joi.array()
        .items(
            Joi.object({
                sku: Joi.string()
                    .trim()
                    .uppercase()
                    .max(100)
                    .required()
                    .messages({
                        "string.base": "Mã SKU phải là chuỗi.",
                        "string.empty":"Mã SKU không được để trống.",
                        "string.max":"Mã SKU tối đa 100 ký tự.",
                        "any.required":"Mã SKU là bắt buộc."
                    }),

                variantName: Joi.string()
                    .trim()
                    .max(255)
                    .allow("", null)
                    .optional()
                    .messages({
                        "string.base": "Tên biến thể phải là chuỗi.",
                        "string.max": "Tên biến thể tối đa 255 ký tự.",
                    }),

                detailDescription: Joi.string()
                    .trim()
                    .allow(null)
                    .optional()
                    .messages({
                        "string.base": "Mô tả chi tiết phải là chuỗi.",
                    }),

                price: Joi.number()
                    .positive()
                    .required()
                    .messages({
                        "number.base": "Giá sản phẩm phải là số.",
                        "number.positive":"Giá sản phẩm phải lớn hơn 0.",
                        "any.required":"Giá sản phẩm là bắt buộc.",
                    }),

                quantityInStock: Joi.number()
                    .integer()
                    .min(0)
                    .required()
                    .messages({
                        "number.base": "Số lượng tồn kho phải là số.",
                        "number.integer":"Số lượng sản phẩm trong kho phải là số nguyên.",
                        "number.min":"Số lượng sản phẩm trong kho không được nhỏ hơn 0.",
                        "any.required":"Số lượng sản phẩm trong kho là bắt buộc.",
                    }),

                attributeValueIds: Joi.array()
                    .items(
                        Joi.string()
                            .trim()
                            .required()
                            .messages({
                                "string.base": "ID giá trị thuộc tính phải là chuỗi.",
                                "string.empty": "ID giá trị thuộc tính không được để trống.",
                                "any.required": "ID giá trị thuộc tính là bắt buộc.",
                            })
                        )
                    .default([])
                    .messages({
                        "array.base": "Danh sách giá trị thuộc tính không hợp lệ.",
                    }),

                specs: Joi.array()
                    .items(
                        Joi.object({
                            specKey: Joi.string()
                                .trim().
                                required()
                                .messages({
                                    "string.base": "Tên thông số kỹ thuật phải là chuỗi.",
                                    "string.empty": "Tên thông số kỹ thuật không được để trống.",
                                    "any.required": "Tên thông số kỹ thuật là bắt buộc.",
                                }),

                            specValue: Joi.string()
                                .trim()
                                .required()
                                .messages({
                                    "string.base": "Giá trị thông số kỹ thuật phải là chuỗi.",
                                    "string.empty": "Giá trị thông số kỹ thuật không được để trống.",
                                    "any.required": "Giá trị thông số kỹ thuật là bắt buộc.",
                                }),
                        })
                    )
                    .default([])
                    .messages({
                        "array.base": "Danh sách thông số kỹ thuật không hợp lệ.",
                    }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Danh sách biến thể không hợp lệ.",
            "array.min": "Sản phẩm phải có ít nhất một biến thể.",
            "any.required": "Danh sách biến thể là bắt buộc.",
        }),
});

export const updateProductVariantSchema = Joi.object({
    sku: Joi.string()
        .trim()
        .optional()
        .messages({
            "string.base": "Mã SKU phải là chuỗi.",
            "string.empty": "Mã SKU không được để trống.",
            "string.max": "Mã SKU tối đa 100 ký tự.",
        }),

    variantName: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional()
        .messages({
            "string.base": "Tên biến thể phải là chuỗi.",
            "string.max": "Tên biến thể tối đa 255 ký tự.",
        }),
    
    detailDescription: Joi.string()
        .trim()
        .allow(null)
        .optional()
        .messages({
            "string.base": "Mô tả chi tiết phải là chuỗi.",
        }),

    price: Joi.number()
        .positive()
        .optional()
        .messages({
            "number.base": "Giá sản phẩm phải là số.",
            "number.positive": "Giá sản phẩm phải lớn hơn 0.",
        }),

    quantityInStock: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.integer":"Số lượng tồn kho phải là số nguyên",
            "number.min":"Số lượng tồn kho phải lớn hơn hoặc bằng 0",
            "any.required":"Số lượng tồn kho là bắt buộc"
        }),

    stockNote: Joi.string()
        .trim()
        .allow("", null)
        .optional(),

    attributeValueIds: Joi.array()
        .items(
            Joi.string()
                .trim()
                .required()
                .messages({
                    "string.base": "ID giá trị thuộc tính phải là chuỗi.",
                    "string.empty": "ID giá trị thuộc tính không được để trống.",
                    "any.required": "ID giá trị thuộc tính là bắt buộc.",
                })
        )
        .default([])
        .optional()
        .messages({
            "array.base": "Danh sách giá trị thuộc tính không hợp lệ.",
        }),

    specs: Joi.array()
        .items(
            Joi.object({
                specKey: Joi.string()
                    .trim()
                    .required()
                    .messages({
                        "string.base": "Tên thông số kỹ thuật phải là chuỗi.",
                        "string.empty": "Tên thông số kỹ thuật không được để trống.",
                        "any.required": "Tên thông số kỹ thuật là bắt buộc.",
                    }),
                specValue: Joi.string()
                    .trim()
                    .required()
                    .messages({
                        "string.base": "Giá trị thông số kỹ thuật phải là chuỗi.",
                        "string.empty": "Giá trị thông số kỹ thuật không được để trống.",
                        "any.required": "Giá trị thông số kỹ thuật là bắt buộc.",
                    }),
            }),
        )
        .optional()
        .messages({
            "array.base": "Danh sách thông số kỹ thuật không hợp lệ.",
        }),

})
    .min(1)
    .with("stockNote", "quantityInStock")
    .messages({
        "object.min": "Phải có ít nhất một trường cần cập nhật.",
        "object.with": "Khi cập nhật ghi chú tồn kho thì phải cung cấp số lượng tồn kho.",
    });