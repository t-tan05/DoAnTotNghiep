import Joi from "joi";
export const createAttributeValueSchema = Joi.object({
    values: Joi.array()
        .items(Joi.object({
        attributeId: Joi.string()
            .trim()
            .required()
            .messages({
            "string.empty": "Mã thuộc tính không được để trống",
            "any.required": "Mã thuộc tính là bắt buộc",
        }),
        value: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .required()
            .messages({
            "string.min": "Giá trị thuộc tính ít nhất 1 ký tự",
            "string.max": "Giá trị thuộc tính tối đa 100 ký tự",
            "any.required": "Giá trị thuộc tính là bắt buộc",
        }),
        displayOrder: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
            "number.integer": "Thứ tự hiển thị phải là số dương",
            "number.min": "Thứ tự hiển thị phải lớn hơn hoặc bằng 0",
        }),
    }))
        .min(1)
        .required()
});
