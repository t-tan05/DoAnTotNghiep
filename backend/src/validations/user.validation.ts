import Joi from "joi";

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty":"Xác nhận mật khẩu cũ không được để trống",
            "any.required":"Xác nhận mật khẩu cũ là bắt buộc"
        }),

    newPassword: Joi.string()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .required()
        .messages({
            "string.min":"Mật khẩu phải có ít nhất 8 ký tự",
            "string.pattern.base": "Mật khẩu phải có chữ hoa, chữ thường và số",
            "any.required":"Mật khẩu mới là bắt buộc",
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only":"Xác nhận mật khẩu không khớp",
            "any.required":"Xác nhận mật khẩu là bắt buộc",
        })

})

export const createEmployeeSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.min":"Tên nhân viên phải có ít nhất 2 ký tự",
            "string.max":"Tên nhân viên không được vượt quá 100 ký tự",
            "any.required":"Tên nhân viên là bắt buộc"
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
