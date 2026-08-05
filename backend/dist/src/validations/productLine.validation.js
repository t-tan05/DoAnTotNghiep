import Joi from "joi";
export const createProductLineSchema = Joi.object({
    lineName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        "string.empty": "Vui lòng nhập tên dòng sản phẩm.",
        "string.min": "Tên dòng sản phẩm phải có ít nhất {#limit} ký tự.",
        "string.max": "Tên dòng sản phẩm không được vượt quá {#limit} ký tự.",
        "any.required": "Tên dòng sản phẩm là bắt buộc.",
    }),
    brandId: Joi.string()
        .trim()
        .required()
        .messages({
        "string.empty": "Vui lòng chọn thương hiệu.",
        "any.required": "Thương hiệu không được để trống.",
    }),
    categoryId: Joi.string()
        .trim()
        .required()
        .messages({
        "string.empty": "Vui lòng chọn danh mục.",
        "any.required": "Danh mục không được để trống.",
    }),
    description: Joi.string()
        .allow("", null)
        .optional()
        .messages({
        "string.base": "Mô tả không hợp lệ.",
    }),
    imageUrl: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Đường dẫn hình ảnh không hợp lệ.",
        "string.max": "Đường dẫn hình ảnh tối đa 255 ký tự.",
    }),
    displayOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự hiển thị phải là số.",
        "number.integer": "Thứ tự hiển thị phải là số nguyên.",
        "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0.",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động không hợp lệ.",
    }),
});
export const updateProductLineSchema = Joi.object({
    lineName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
        "string.empty": "Tên dòng sản phẩm không được để trống.",
        "string.min": "Tên dòng sản phẩm phải có ít nhất 2 ký tự.",
        "string.max": "Tên dòng sản phẩm tối đa 100 ký tự.",
    }),
    brandId: Joi.string()
        .trim()
        .optional()
        .messages({
        "string.empty": "Thương hiệu không được để trống.",
    }),
    categoryId: Joi.string()
        .trim()
        .optional()
        .messages({
        "string.empty": "Danh mục không được để trống.",
    }),
    description: Joi.string()
        .allow("", null)
        .optional()
        .messages({
        "string.base": "Mô tả không hợp lệ.",
    }),
    imageUrl: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Đường dẫn hình ảnh không hợp lệ.",
        "string.max": "Đường dẫn hình ảnh tối đa 255 ký tự.",
    }),
    displayOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự hiển thị phải là số.",
        "number.integer": "Thứ tự hiển thị phải là số nguyên.",
        "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0.",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động không hợp lệ.",
    }),
})
    .min(1)
    .messages({
    "object.min": "Vui lòng cung cấp ít nhất một trường để cập nhật.",
});
