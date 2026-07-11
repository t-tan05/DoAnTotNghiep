export type AiChatPayload = {
    conversationId?: string;
    message: string;
};

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