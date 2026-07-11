import prisma from "#config/prisma";
import { ai_conversations_status, ai_messages_status, Prisma } from "@prisma/client";

export function findConversationByOwner(conversationId: string, owner: { userId?: string | null; guestId?: string | null }) {
    return prisma.ai_conversations.findFirst({
        where: {
            conversation_id: conversationId,
            status: ai_conversations_status.ACTIVE,
            OR: [
                owner.userId ? { user_id: owner.userId } : undefined,
                owner.guestId ? { guest_id: owner.guestId } : undefined,
            ].filter(Boolean) as any,
        },
    });
}

export function createAiConversation(data: {
    conversationId: string;
    userId?: string | null;
    guestId?: string | null;
    title?: string | null;
}) {
    return prisma.ai_conversations.create({
        data: {
            conversation_id: data.conversationId,
            user_id: data.userId || null,
            guest_id: data.guestId || null,
            title: data.title || null,
        },
    });
}

export function getConversationMessages(conversationId: string, limit = 12) {
    return prisma.ai_messages.findMany({
        where: {
            conversation_id: conversationId,
            status: ai_messages_status.COMPLETED,
        },
        orderBy: {
            created_at: "desc",
        },
        take: limit,
    });
}

export function findLatestConversationByOwner(owner: { userId?: string | null; guestId?: string | null }) {
    return prisma.ai_conversations.findFirst({
        where: {
            status: ai_conversations_status.ACTIVE,
            OR: [
                owner.userId ? { user_id: owner.userId } : undefined,
                owner.guestId ? { guest_id: owner.guestId } : undefined,
            ].filter(Boolean) as any,
        },
        orderBy: {
            updated_at: "desc",
        },
    });
}

export function getConversationMessagesWithSuggestions(conversationId: string) {
    return prisma.ai_messages.findMany({
        where: {
            conversation_id: conversationId,
            status: ai_messages_status.COMPLETED,
        },
        include: {
            ai_product_suggestions: {
                orderBy: {
                    sort_order: "asc",
                },
            },
        },
        orderBy: {
            created_at: "asc",
        },
    });
}

export function createAiMessage(data: Prisma.ai_messagesUncheckedCreateInput) {
    return prisma.ai_messages.create({
        data,
    });
}

export function createAiProductSuggestions(items: Array<{
    suggestionId: string;
    messageId: string;
    productId: string | null;
    variantId: string | null;
    reason?: string | null;
    sortOrder: number;
    productNameSnapshot?: string | null;
    variantNameSnapshot?: string | null;
    priceSnapshot?: number | null;
    imageUrlSnapshot?: string | null;
}>) {
    if(!items.length) return Promise.resolve({ count: 0 });

    return prisma.ai_product_suggestions.createMany({
        data: items.map((item) => ({
            suggestion_id: item.suggestionId,
            message_id: item.messageId,
            product_id: item.productId,
            variant_id: item.variantId,
            reason: item.reason || null,
            sort_order: item.sortOrder,
            product_name_snapshot: item.productNameSnapshot || null,
            variant_name_snapshot: item.variantNameSnapshot || null,
            price_snapshot: item.priceSnapshot ?? null,
            image_url_snapshot: item.imageUrlSnapshot || null,
        })),
    });
}

export function findProductsForAi(keyword: string) {
    const words = keyword
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length >= 2)
        .slice(0, 8);

    return prisma.product_variants.findMany({
        where: {
            quantity_in_stock: {
                gt: 0,
            },
            OR: words.flatMap((word) => [
                { variant_name: { contains: word } },
                { products: { product_name: { contains: word } } },
                { products: { brands: { brand_name: { contains: word } } } },
                { products: { categories: { category_name: { contains: word } } } },
                { products: { product_lines: { line_name: { contains: word } } } },
            ]),
        },
        include: {
            products: {
                include: {
                    brands: true,
                    categories: true,
                    product_lines: true,
                },
            },
            product_variant_specs: {
                orderBy: {
                    display_order: "asc",
                },
                take: 8,
            },
        },
        orderBy: [
            { sold_quantity: "desc" },
            { created_at: "desc" },
        ],
        take: 8,
    });
}
