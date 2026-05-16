import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.min":"Tên người dùng phải có ít nhất 2 ký tự",
            "string.max":"Tên người dùng không được vượt quá 100 ký tự",
            "any.required":"Tên người dùng là bắt buộc"
        }),

    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.email":"Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty":"Email không được để trống",
        }),

    password: Joi.string()
        .trim()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .required()
        .messages({
            "string.min":"Mật khẩu phải có ít nhất 8 ký tự",
            "string.pattern.base": "Mật khẩu phải có chữ hoa, chữ thường và số",
            "any.required":"Mật khẩu là bắt buộc",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only":"Xác nhận mật khẩu không khớp",
            "any.required":"Xác nhận mật khẩu là bắt buộc",
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.email":"Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty":"Email không được để trống",
        }),
    
    password: Joi.string()
        .required()
        .messages({
            "string.empty":"Mật khẩu không được để trống",
            "any.required":"Mật khẩu là bắt buộc",
        }),
});

export const verifyEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.email":"Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty":"Email không được để trống",
        }),
    
    verifyToken: Joi.string()
        .trim()
        .length(6)
        .alphanum()
        .required()
        .messages({
            "string.length":"Mã xác thực phải có đúng 6 ký tự",
            "string.alphanum":"Mã xác thực chỉ được gồm chữ và số",
            "any.required":"Mã xác thực là bắt buộc",
        }),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.email":"Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty":"Email không được để trống",
        }),
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.email":"Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty":"Email không được để trống",
        }),
    
    resetCode: Joi.string()
        .trim()
        .length(6)
        .alphanum()
        .required()
        .messages({
            "string.length":"Mã xác thực phải có đúng 6 ký tự",
            "string.alphanum":"Mã xác thực chỉ được gồm chữ và số",
            "any.required":"Mã xác thực là bắt buộc",
        }),

    newPassword: Joi.string()
        .trim()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .required()
        .messages({
            "string.min":"Mật khẩu phải có ít nhất 8 ký tự",
            "string.pattern.base": "Mật khẩu phải có chữ hoa, chữ thường và số",
            "any.required":"Mật khẩu là bắt buộc",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only":"Xác nhận mật khẩu không khớp",
            "any.required":"Xác nhận mật khẩu là bắt buộc",
        })
})
