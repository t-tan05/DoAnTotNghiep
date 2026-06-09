import Joi from "joi";

export const createAddressSchema = Joi.object({
    receiverName: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.empty":"Tên người nhận không được để trống.",
            "string.max":"Tên người nhận quá dài. Vui lòng làm ngắn lại.",
            "any.required":"Tên người nhận là bắt buộc.",
        }),

    phoneNumber: Joi.string()
        .trim()
        .pattern(/^0\d{9,10}$/)
        .required()
        .messages({
            "string.empty":"Số điện thoại không được để trống",
            "string.pattern.base":"Số điện thoại không hợp lệ.",
            "any.required":"Số điện thoại là bắt buộc.",
        }),

    province: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.empty":"Tỉnh / Thành phố không được để trống.",
            "any.required":"Tỉnh / Thành phố là bắt buộc.",
        }),

    ward: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.empty":"Xã / Phường không được để trống.",
            "any.required":"Xã / Phường là bắt buộc."
        }),
    
    street: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
            "string.empty":"Tên đường không được để trống.",
            "string.max":"Tên đường quá dài. Vui lòng viết ngắn lại.",
            "any.required":"Tên đường là bắt buộc."
        }),

    setDefault: Joi.boolean()
        .default(false),
    
})