import Joi from "joi";
export const createPromotionSchema = Joi.object({
    promotionName: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
        "string.empty": "Ten khuyen mai khong duoc de trong",
        "string.max": "Ten khuyen mai toi da 100 ky tu",
        "any.required": "Ten khuyen mai la bat buoc",
    }),
    description: Joi.string()
        .trim()
        .allow("", null)
        .optional(),
    discountType: Joi.string()
        .valid("PERCENT", "FIXED")
        .required()
        .messages({
        "any.only": "Loai giam gia khong hop le",
        "any.required": "Loai giam gia la bat buoc",
    }),
    discountValue: Joi.number()
        .positive()
        .required()
        .messages({
        "number.base": "Gia tri giam gia phai la so",
        "number.positive": "Gia tri giam gia phai la so duong",
        "any.required": "Gia tri giam gia la bat buoc",
    }),
    startDate: Joi.date()
        .iso()
        .required()
        .messages({
        "date.base": "Ngay bat dau khong hop le",
        "date.format": "Ngay bat dau phai theo dinh dang ISO",
        "date.iso": "Ngay bat dau phai theo dinh dang ISO",
        "any.required": "Ngay bat dau la bat buoc",
    }),
    endDate: Joi.date()
        .iso()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
        "date.base": "Ngay ket thuc khong hop le",
        "date.format": "Ngay ket thuc phai theo dinh dang ISO",
        "date.iso": "Ngay ket thuc phai theo dinh dang ISO",
        "date.greater": "Ngay ket thuc phai sau ngay bat dau",
        "any.required": "Ngay ket thuc la bat buoc",
    }),
    productIds: Joi.array()
        .items(Joi.string()
        .trim()
        .messages({
        "string.base": "ID san pham phai la chuoi",
        "string.empty": "ID san pham khong duoc de trong",
    }))
        .default([])
        .messages({
        "array.base": "Danh sach san pham phai la mot mang",
    }),
});
export const updatePromotionSchema = Joi.object({
    promotionName: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
        "string.empty": "Ten khuyen mai khong duoc de trong",
        "string.max": "Ten khuyen mai toi da 100 ky tu",
    }),
    description: Joi.string()
        .trim()
        .allow("", null)
        .optional(),
    discountType: Joi.string()
        .valid("PERCENT", "FIXED")
        .optional()
        .messages({
        "any.only": "Loai giam gia khong hop le",
    }),
    discountValue: Joi.number()
        .positive()
        .optional()
        .messages({
        "number.base": "Gia tri giam gia phai la so",
        "number.positive": "Gia tri giam gia phai lon hon 0",
    }),
    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
        "date.base": "Ngay bat dau khong hop le",
        "date.iso": "Ngay bat dau phai theo dinh dang ISO",
    }),
    endDate: Joi.date()
        .iso()
        .optional()
        .messages({
        "date.base": "Ngay ket thuc khong hop le",
        "date.iso": "Ngay ket thuc phai theo dinh dang ISO",
    }),
}).min(1).messages({
    "object.min": "Phai cung cap it nhat mot truong de cap nhat",
});
export const attachProductsToPromotionSchema = Joi.object({
    productIds: Joi.array()
        .items(Joi.string()
        .trim()
        .required()
        .messages({
        "string.base": "ID san pham phai la chuoi",
        "string.empty": "ID san pham khong duoc de trong",
        "any.required": "ID san pham la bat buoc",
    }))
        .min(1)
        .required()
        .messages({
        "array.base": "Danh sach san pham phai la mot mang",
        "array.min": "Phai chon it nhat mot san pham",
        "any.required": "Danh sach san pham la bat buoc",
    }),
});
