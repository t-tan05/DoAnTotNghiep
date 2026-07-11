import Joi from "joi";
export const aiChatSchema = Joi.object({
    conversationId: Joi.string()
        .trim()
        .max(50)
        .optional()
        .messages({
        "string.base": "ID cuộc trò chuyện phải là chuỗi",
        "string.empty": "ID cuộc trò chuyện không được để trống",
        "string.max": "ID cuộc trò chuyện không được vượt quá {#limit} ký tự",
    }),
    message: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
        "string.base": "Tin nhắn phải là chuỗi",
        "string.empty": "Tin nhắn không được để trống",
        "string.min": "Tin nhắn phải có ít nhất {#limit} ký tự",
        "string.max": "Tin nhắn không được vượt quá {#limit} ký tự",
        "any.required": "Tin nhắn là bắt buộc",
    }),
});
