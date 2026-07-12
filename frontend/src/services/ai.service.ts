import { api } from "./api";
import type { AiChatResponse, AiConversationHistoryResponse } from "@/types/ai.type";

export const aiService = {
    chat(payload: {
        message: string;
        conversationId?: string | null;
    }) {
        const body = {
            message: payload.message,
            ...(payload.conversationId ? { conversationId: payload.conversationId } : {}),
        };

        return api.post<AiChatResponse>("/ai/chat", body, {
            timeout: 90000,
        }).then((res) => res.data);
    },

    getLatestConversation() {
        return api.get<AiConversationHistoryResponse>("/ai/conversations/latest").then((res) => res.data);
    },

    getConversation(conversationId: string) {
        return api.get<AiConversationHistoryResponse>(`/ai/conversations/${conversationId}`).then((res) => res.data);
    },
};
