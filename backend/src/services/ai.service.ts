import { createAiConversation, createAiMessage, createAiProductSuggestions, findConversationByOwner, findLatestConversationByOwner, findProductsForAi, getConversationMessages, getConversationMessagesWithSuggestions } from "#models/ai.model";
import { AiChatPayload, AiProductSuggestion } from "#types/ai.type";
import AppError from "#utils/AppError";
import { ai_messages_role, ai_messages_status } from "@prisma/client";
import crypto from "crypto";

function buildSystemPrompt() {
    return [
        "Bạn là chatbot tư vấn mua hàng cho website bán đồ công nghệ.",
        "Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn.",
        "Nếu khách hỏi thiếu thông tin, hãy hỏi thêm nhu cầu, ngân sách, kích thước, thương hiệu hoặc mục đích sử dụng.",
        "Chỉ gợi ý sản phẩm có trong danh sách backend cung cấp.",
        "Không bịa giá, tồn kho, khuyến mãi hoặc link.",
        "Không tiết lộ các thông tin nhạy cảm của các tài khoản khác và dữ liệu nhạy cảm ra ngoài.",
    ].join("\n");
}

function mapSuggestion(variant: any): AiProductSuggestion {
    const product = variant.products;
    const price = Number(variant.discount_price ?? variant.price ?? 0);

    return {
        productId: product.product_id,
        variantId: variant.variant_id,
        name: product.product_name,
        variantName: variant.variant_name || null,
        price,
        imageUrl: variant.image_url || null,
        url: `/products/${product.product_id}?variantId=${variant.variant_id}`,
    };
}

function buildProductContext(suggestions: AiProductSuggestion[]) {
    if(!suggestions.length) {
        return "Không tìm thấy sản phẩm phù hợp trong hệ thống.";
    }

    return suggestions.map((item, index) => {
        return `${index + 1}. ${item.variantName || item.name}
                - Giá: ${item.price.toLocaleString("vi-VN")}đ
                - Link: ${item.url}`;
    }).join("\n\n");
}

function parseAiResponseText(text: string) {
    const trimmed = text.trim();

    if(trimmed.startsWith("data:")) {
        const payloads = trimmed
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.replace(/^data:\s*/, ""))
            .filter((line) => line && line !== "[DONE]");

        const parsedPayloads = payloads.map((line) => JSON.parse(line));
        const fullMessagePayload = parsedPayloads.find((payload) => payload?.choices?.[0]?.message?.content);

        if(fullMessagePayload) return fullMessagePayload;

        const content = parsedPayloads
            .map((payload) => payload?.choices?.[0]?.delta?.content || "")
            .join("");
        const usagePayload = [...parsedPayloads].reverse().find((payload) => payload?.usage);

        return {
            choices: [
                {
                    message: {
                        content,
                    },
                },
            ],
            usage: usagePayload?.usage || null,
        };
    }

    return JSON.parse(trimmed);
}

export async function chatWithAiService(payload: AiChatPayload, owner: { userId?: string | null; guestId?: string | null }) {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL;

    if(!apiKey || !baseUrl || !model) {
        throw new AppError("Chưa cấu hình cho chatbox AI ", 500);
    }

    let conversationId =  payload.conversationId;
    let conversation = conversationId ? await findConversationByOwner(conversationId, owner) : null;

    if(conversationId && !conversation) {
        throw new AppError("Không tìm thấy cuộc trò chuyện.", 404);
    }

    if(!conversation) {
        conversationId = crypto.randomUUID();

        conversation = await createAiConversation({
            conversationId,
            userId: owner.userId || null,
            guestId: owner.userId ? null : owner.guestId,
            title: payload.message.slice(0, 80),
        });

        await createAiMessage({
            message_id: crypto.randomUUID(),
            conversation_id: conversationId,
            role: ai_messages_role.SYSTEM,
            content: buildSystemPrompt(),
        });
    }

    const activeConversationId = conversationId!;

    await createAiMessage({
        message_id: crypto.randomUUID(),
        conversation_id: activeConversationId,
        role: ai_messages_role.USER,
        content: payload.message,
    });

    const variants = await findProductsForAi(payload.message);
    const suggestions = variants.map(mapSuggestion);
    const history = (await getConversationMessages(activeConversationId, 12)).reverse();

    const messages = [
        { role: "system", content: buildSystemPrompt() },
        { role: "system", content: `Sản phẩm hệ thống tìm được:\n${buildProductContext(suggestions)}` },
        ...history
            .filter((item) => item.role !== ai_messages_role.SYSTEM)
            .map((item) => ({
                role: item.role === ai_messages_role.USER ? "user": "assistant",
                content: item.content,
            })),
    ];

    const startedAt = Date.now();

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.4,
                stream: false,
            }),
        });

        const responseTimeMs = Date.now() - startedAt;

        if(!response.ok) {
            const text = await response.text();

            await createAiMessage({
                message_id: crypto.randomUUID(),
                conversation_id: activeConversationId,
                role: ai_messages_role.ASSISTANT,
                content: "Xin lỗi, hiện tại mình chưa tư vấn được. Bạn thử lại sau nhé.",
                status: ai_messages_status.FAILED,
                model_name: model,
                response_time_ms: responseTimeMs,
                error_message: text.slice(0, 500),
            });

            throw new AppError("AI API đang lỗi.", 502);
        }

        const text = await response.text();
        const data = parseAiResponseText(text);
        const answer = data?.choices?.[0]?.message?.content || "Xin lỗi, mình chưa có câu trả lời phù hợp.";
        const usage = data?.usage;

        const assistantMessage = await createAiMessage({
            message_id: crypto.randomUUID(),
            conversation_id: activeConversationId,
            role: ai_messages_role.ASSISTANT,
            content: answer,
            model_name: model,
            prompt_tokens: usage?.prompt_tokens ?? null,
            completion_tokens: usage?.completion_tokens ?? null,
            response_time_ms: responseTimeMs,
            metadata: {
                rawUsage: usage || null,
            },
        });

        await createAiProductSuggestions(
            suggestions.map((item, index) => ({
                suggestionId: crypto.randomUUID(),
                messageId: assistantMessage.message_id,
                productId: item.productId,
                variantId: item.variantId,
                sortOrder: index,
                productNameSnapshot: item.name,
                variantNameSnapshot: item.variantName,
                priceSnapshot: item.price,
                imageUrlSnapshot: item.imageUrl,
            }))
        );

        return {
            conversationId: activeConversationId,
            answer,
            suggestions,
        };
    }catch(error) {
        console.error("AI connection error:", error);
        if(error instanceof AppError) throw error;
        throw new AppError("Không thể kết nối AI.", 502);
    }
}

function mapStoredSuggestion(item: any): AiProductSuggestion {
    return {
        productId: item.product_id,
        variantId: item.variant_id,
        name: item.product_name_snapshot || "Sản phẩm",
        variantName: item.variant_name_snapshot || null,
        price: Number(item.price_snapshot ?? 0),
        imageUrl: item.image_url_snapshot || null,
        url: item.product_id && item.variant_id
            ? `/products/${item.product_id}?variantId=${item.variant_id}`
            : null,
        reason: item.reason || null,
    };
}

async function buildConversationHistoryResponse(conversation: any) {
    const messages = await getConversationMessagesWithSuggestions(conversation.conversation_id);

    return {
        conversation: {
            conversationId: conversation.conversation_id,
            title: conversation.title,
            status: conversation.status,
            createdAt: conversation.created_at,
            updatedAt: conversation.updated_at,
        },
        messages: messages
            .filter((message) => message.role !== ai_messages_role.SYSTEM)
            .map((message) => ({
                messageId: message.message_id,
                role: message.role,
                content: message.content,
                createdAt: message.created_at,
                suggestions: message.ai_product_suggestions.map(mapStoredSuggestion),
            })),
    };
}

export async function getLatestAiConversationService(owner: { userId?: string | null; guestId?: string | null }) {
    const conversation = await findLatestConversationByOwner(owner);

    if(!conversation) {
        return {
            conversation: null,
            messages: [],
        };
    }

    return buildConversationHistoryResponse(conversation);
}

export async function getAiConversationDetailService(
    conversationId: string,
    owner: { userId?: string | null; guestId?: string | null },
) {
    const conversation = await findConversationByOwner(conversationId, owner);

    if(!conversation) {
        throw new AppError("Không tìm thấy cuộc trò chuyện.", 404);
    }

    return buildConversationHistoryResponse(conversation);
}
