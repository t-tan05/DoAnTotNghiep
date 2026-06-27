import Joi from "joi";

export const checkoutOrderSchema = Joi.object({
    addressId: Joi.string().trim().required().messages({
        "string.base":"Mã địa chỉ phải là chuỗi.",
        "string.empty":"Mã địa chỉ không được để trống.",
        "any.required":"Mã địa chỉ là bắt buộc.",
    }),
    paymentMethod: Joi.string()
        .valid("COD", "VNPAY", "MOMO", "ZALOPAY", "BANK_TRANSFER")
        .required().messages({
            "any.only":"Phương thức thanh toán không hợp lệ.",
            "any.required":"Vui lòng chọn phương thức thanh toán.",
        }),
});

export const buyNowOrderSchema = Joi.object({
    variantId: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng chọn sản phẩm.",
        "any.required": "Vui lòng chọn sản phẩm.",
    }),
    addressId: Joi.string().trim().required().messages({
        "string.base":"Mã địa chỉ phải là chuỗi.",
        "string.empty":"Mã địa chỉ không được để trống.",
        "any.required":"Mã địa chỉ là bắt buộc.",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "Số lượng không hợp lệ.",
        "number.integer": "Số lượng phải là số nguyên.",
        "number.min": "Số lượng tối thiểu là 1.",
        "any.required": "Vui lòng nhập số lượng.",
    }),
    paymentMethod: Joi.string()
        .valid("COD", "VNPAY", "MOMO", "ZALOPAY", "BANK_TRANSFER")
        .required().messages({
            "any.only":"Phương thức thanh toán không hợp lệ.",
            "any.required":"Vui lòng chọn phương thức thanh toán.",
        }),
});

