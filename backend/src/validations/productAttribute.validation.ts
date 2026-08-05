import Joi from "joi";

export const createProductAttributeSchema = Joi.object({
    attributes: Joi.array()
        .items(
            Joi.object({
                attributeName: Joi.string()
                    .trim()
                    .min(2)
                    .max(50)
                    .required()
                    .messages({
                        "string.empty": "Tên thuộc tính không được để trống.",
                        "string.min":"Tên thuộc tính ít nhất 2 ký tự.",
                        "string.max":"Tên thuộc tính tối đa 50 ký tự.",
                        "any.required":"Tên thuộc tính không được để trống.",
                    }),
                displayOrder: Joi.number()
                    .integer()
                    .min(0)
                    .default(0)
                    .messages({
                        "number.base": "Thứ tự hiển thị phải là số.",
                        "number.integer":"Thứ tự hiển thị phải là số nguyên.",
                        "number.min":"Thứ tự hiển thị phải lớn hơn hoặc bằng 0.",
                    }),
            })
        )
        .min(1)
        .required()
        .messages({
            "number.base": "Thứ tự hiển thị phải là số.",
            "number.integer": "Thứ tự hiển thị phải là số nguyên.",
            "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0.",
        })
});

export const updateProductAttributeSchema = Joi.object({
    attributeName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
            "string.empty": "Tên thuộc tính không được để trống.",
            "string.min":"Tên thuộc tính ít nhất 2 ký tự",
            "string.max":"Tên thuộc tính tối đa 50 ký tự",
        }),
    displayOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base": "Thứ tự hiển thị phải là số.",
            "number.integer":"Thứ tự hiển thị phải là số nguyên",
            "number.min":"Thứ tự hiển thị phải lớn hơn hoặc bằng 0",
        }),
})
.min(1)
.messages({
    "object.min": "Vui lòng cung cấp ít nhất một trường để cập nhật.",
});;
