import Joi from "joi";
export const importExternalNewsSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        "string.empty": "URL bài viết là bắt buộc.",
        "string.uri": "URL bài viết không hợp lệ.",
        "any.required": "URL bài viết là bắt buộc.",
    }),
    sourceId: Joi.string()
        .valid("vnexpress-so-hoa", "tinhte", "genk", "techcrunch", "the-verge")
        .optional(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").default("DRAFT"),
});
