import Joi from "joi";
export const checkoutOrderSchema = Joi.object({
    addressId: Joi.string().trim().required().messages({
        "string.base": "Mã địa chỉ phải là chuỗi.",
        "string.empty": "Mã địa chỉ không được để trống.",
        "any.required": "Mã địa chỉ là bắt buộc.",
    }),
    paymentMethod: Joi.string()
        .valid("COD", "VNPAY", "MOMO", "ZALOPAY", "BANK_TRANSFER")
        .required().messages({
        "any.only": "Phương thức thanh toán không hợp lệ.",
        "any.required": "Vui lòng chọn phương thức thanh toán.",
    }),
});
