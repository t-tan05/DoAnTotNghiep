import Joi from "joi";
export const createBlogSchema = Joi.object({
    title: Joi.string().trim().max(255).required().messages({
        "string.empty": "Tiêu đề không được để trống.",
        "string.max": "Tiêu đề tối đa 255 ký tự.",
        "any.required": "Tiêu đề là bắt buộc.",
    }),
    content: Joi.string().trim().required().messages({
        "string.empty": "Nội dung không được để trống.",
        "any.required": "Nội dung là bắt buộc.",
    }),
    categoryId: Joi.string().trim().allow("", null).optional(),
    status: Joi.string()
        .valid("DRAFT", "PUBLISHED", "ARCHIVED")
        .default("DRAFT"),
    thumbnailUrl: Joi.string().trim().allow("", null).optional(),
});
export const updateBlogSchema = Joi.object({
    title: Joi.string().trim().max(255).optional().messages({
        "string.empty": "Tiêu đề không được để trống.",
        "string.max": "Tiêu đề tối đa 255 ký tự.",
    }),
    content: Joi.string().trim().optional().messages({
        "string.empty": "Nội dung không được để trống.",
    }),
    categoryId: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").optional(),
    thumbnailUrl: Joi.string().trim().allow("", null).optional(),
}).min(1);
