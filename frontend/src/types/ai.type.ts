export type AiMessageRole = "USER" | "ASSISTANT";

export type AiProductSuggestion = {
    productId: string | null;
    variantId: string | null;
    name: string;
    variantName: string | null;
    price: number;
    imageUrl: string | null;
    url: string | null;
    reason?: string | null;
};

export type AiChatMessage = {
    messageId?: string;
    role: AiMessageRole;
    content: string;
    createdAt?: string;
    suggestions?: AiProductSuggestion[];
};

export type AiConversation = {
    conversationId: string;
    title: string | null;
    status: "ACTIVE" | "CLOSED";
    createdAt: string;
    updatedAt: string;
};

export type AiChatResponse = {
    message: string;
    data: {
        conversationId: string;
        answer: string;
        suggestions: AiProductSuggestion[];
    };
};

export type AiConversationHistoryResponse = {
    message: string;
    data: {
        conversation: AiConversation | null;
        messages: AiChatMessage[];
    };
};