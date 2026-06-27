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
export const buyNowOrderSchema = Joi.object({
    variantId: Joi.string().trim().required().messages({
        "string.empty": "Vui long chon san pham.",
        "any.required": "Vui long chon san pham.",
    }),
    addressId: Joi.string().trim().required().messages({
        "string.base": "Ma dia chi phai la chuoi.",
        "string.empty": "Ma dia chi khong duoc de trong.",
        "any.required": "Ma dia chi la bat buoc.",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "So luong khong hop le.",
        "number.integer": "So luong phai la so nguyen.",
        "number.min": "So luong toi thieu la 1.",
        "any.required": "Vui long nhap so luong.",
    }),
    paymentMethod: Joi.string()
        .valid("COD", "VNPAY", "MOMO", "ZALOPAY", "BANK_TRANSFER")
        .required().messages({
        "any.only": "Phuong thuc thanh toan khong hop le.",
        "any.required": "Vui long chon phuong thuc thanh toan.",
    }),
});
