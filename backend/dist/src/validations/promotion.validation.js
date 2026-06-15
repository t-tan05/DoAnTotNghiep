import Joi from "joi";
export const createPromotionSchema = Joi.object({
    promotionName: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
        "string.empty": "Tên khuyến mãi không được để trống.",
        "string.max": "Tên khuyến mãi tối đa 100 ký tự.",
        "any.required": "Tên khuyến mãi là bắt buộc.",
    }),
    description: Joi.string()
        .trim()
        .allow("", null)
        .optional(),
    discountType: Joi.string()
        .valid("PERCENT", "FIXED")
        .required()
        .messages({
        "any.only": "Loại giảm giá không hợp lệ.",
        "any.required": "Loại giảm giá là bắt buộc.",
    }),
    discountValue: Joi.number()
        .positive()
        .required()
        .messages({
        "number.base": "Giá trị giảm giá phải là số.",
        "number.positive": "Giá trị giảm giá phải là số dương.",
        "any.required": "Giá trị giảm giá là bắt buộc.",
    }),
    startDate: Joi.date()
        .iso()
        .required()
        .messages({
        "date.base": "Ngày bắt đầu không hợp lệ.",
        "date.format": "Ngày bắt đầu phải theo định dạng ISO.",
        "date.iso": "Ngày bắt đầu phải theo định dạng ISO.",
        "any.required": "Ngày bắt đầu là bắt buộc.",
    }),
    endDate: Joi.date()
        .iso()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
        "date.base": "Ngày kết thúc không hợp lệ.",
        "date.format": "Ngày kết thúc phải theo định dạng ISO.",
        "date.iso": "Ngày kết thúc phải theo định dạng ISO.",
        "date.greater": "Ngày kết thúc phải sau ngày bắt đầu.",
        "any.required": "Ngày kết thúc là bắt buộc.",
    }),
    productIds: Joi.array()
        .items(Joi.string()
        .trim()
        .messages({
        "string.base": "ID sản phẩm phải là chuỗi.",
        "string.empty": "ID sản phẩm không được để trống.",
    }))
        .default([])
        .messages({
        "array.base": "Danh sách sản phẩm phải là một mảng.",
    }),
});
export const updatePromotionSchema = Joi.object({
    promotionName: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
        "string.empty": "Tên khuyến mãi không được để trống.",
        "string.max": "Tên khuyến mãi tối đa 100 ký tự.",
    }),
    description: Joi.string()
        .trim()
        .allow("", null)
        .optional(),
    discountType: Joi.string()
        .valid("PERCENT", "FIXED")
        .optional()
        .messages({
        "any.only": "Loại giảm giá không hợp lệ.",
    }),
    discountValue: Joi.number()
        .positive()
        .optional()
        .messages({
        "number.base": "Giá trị giảm giá phải là số.",
        "number.positive": "Giá trị giảm giá phải lớn hơn 0.",
    }),
    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
        "date.base": "Ngày bắt đầu không hợp lệ.",
        "date.iso": "Ngày bắt đầu phải theo định dạng ISO.",
    }),
    endDate: Joi.date()
        .iso()
        .optional()
        .messages({
        "date.base": "Ngày kết thúc không hợp lệ.",
        "date.iso": "Ngày kết thúc phải theo định dạng ISO.",
    }),
}).min(1).messages({
    "object.min": "Phải cung cấp ít nhất một trường để cập nhật.",
});
export const attachProductsToPromotionSchema = Joi.object({
    productIds: Joi.array()
        .items(Joi.string()
        .trim()
        .messages({
        "string.base": "ID sản phẩm phải là chuỗi.",
        "string.empty": "ID sản phẩm không được để trống.",
        "any.required": "ID sản phẩm là bắt buộc.",
    }))
        .default([])
        .messages({
        "array.base": "Danh sách sản phẩm phải là một mảng.",
    }),
});
