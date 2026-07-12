import prisma from "#config/prisma";
import { ai_conversations_status, ai_messages_status } from "@prisma/client";
export function findConversationByOwner(conversationId, owner) {
    return prisma.ai_conversations.findFirst({
        where: {
            conversation_id: conversationId,
            status: ai_conversations_status.ACTIVE,
            OR: [
                owner.userId ? { user_id: owner.userId } : undefined,
                owner.guestId ? { guest_id: owner.guestId } : undefined,
            ].filter(Boolean),
        },
    });
}
export function createAiConversation(data) {
    return prisma.ai_conversations.create({
        data: {
            conversation_id: data.conversationId,
            user_id: data.userId || null,
            guest_id: data.guestId || null,
            title: data.title || null,
        },
    });
}
export function getConversationMessages(conversationId, limit = 12) {
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
export function findLatestConversationByOwner(owner) {
    return prisma.ai_conversations.findFirst({
        where: {
            status: ai_conversations_status.ACTIVE,
            OR: [
                owner.userId ? { user_id: owner.userId } : undefined,
                owner.guestId ? { guest_id: owner.guestId } : undefined,
            ].filter(Boolean),
        },
        orderBy: {
            updated_at: "desc",
        },
    });
}
export function getConversationMessagesWithSuggestions(conversationId) {
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
export function createAiMessage(data) {
    return prisma.ai_messages.create({
        data,
    });
}
export function createAiProductSuggestions(items) {
    if (!items.length)
        return Promise.resolve({ count: 0 });
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
function normalizeSearchText(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}
const STOP_WORDS = new Set([
    "ban", "minh", "toi", "tui", "can", "muon", "mua", "tim", "kiem", "chon", "tu", "van",
    "san", "pham", "hang", "gia", "tam", "duoi", "tren", "trieu", "cho", "voi", "cua",
    "la", "co", "khong", "sao", "goi", "y", "roi", "nhe", "nha", "giup", "phu", "hop",
]);
function extractMeaningfulWords(text) {
    return normalizeSearchText(text)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 3)
        .filter((word) => !STOP_WORDS.has(word))
        .filter((word) => !/^\d+$/.test(word))
        .slice(0, 8);
}
function extractBudget(text) {
    const normalized = normalizeSearchText(text);
    const millionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr)\b/);
    if (millionMatch) {
        return Number(millionMatch[1].replace(",", ".")) * 1_000_000;
    }
    const vndMatch = normalized.match(/(\d{7,})/);
    return vndMatch ? Number(vndMatch[1]) : null;
}
function detectProductIntent(text) {
    const normalized = normalizeSearchText(text);
    const wantsLaptop = /(mua|tim|kiem|chon|tu van|can|muon).{0,40}(laptop|macbook|may tinh xach tay)|\b(laptop|macbook|notebook|may tinh xach tay)\b/.test(normalized);
    const wantsPhone = /(mua|tim|kiem|chon|tu van|can|muon).{0,40}(dien thoai|smartphone|iphone|samsung galaxy)|\b(dien thoai|smartphone|iphone)\b/.test(normalized);
    if (wantsLaptop) {
        return ["laptop", "macbook", "notebook", "may tinh xach tay"];
    }
    if (wantsPhone) {
        return ["dien thoai", "smartphone", "iphone"];
    }
    return [];
}
function buildIntentWhere(intentTerms) {
    if (!intentTerms.length)
        return null;
    return {
        OR: intentTerms.flatMap((term) => [
            { variant_name: { contains: term } },
            { products: { product_name: { contains: term } } },
            { products: { categories: { category_name: { contains: term } } } },
            { products: { categories: { normalized_name: { contains: term.replace(/\s+/g, "-") } } } },
            { products: { product_lines: { line_name: { contains: term } } } },
        ]),
    };
}
function scoreVariantForAi(variant, text, budget, intentTerms) {
    const product = variant.products;
    const haystack = normalizeSearchText([
        variant.variant_name,
        product?.product_name,
        product?.brands?.brand_name,
        product?.categories?.category_name,
        product?.product_lines?.line_name,
        ...variant.product_variant_specs.map((spec) => `${spec.spec_key} ${spec.spec_value}`),
    ].filter(Boolean).join(" "));
    const words = extractMeaningfulWords(text);
    const price = Number(variant.price ?? 0);
    let score = 0;
    if (intentTerms.some((term) => haystack.includes(term)))
        score += 1000;
    words.forEach((word) => {
        if (haystack.includes(word))
            score += 40;
    });
    if (budget && price > 0) {
        const distance = Math.abs(price - budget) / budget;
        score += Math.max(0, 300 - distance * 300);
        if (price <= budget)
            score += 80;
        if (price > budget * 1.1)
            score -= 500;
    }
    score += Math.min(Number(variant.sold_quantity ?? 0), 50);
    return score;
}
export async function findProductsForAi(keyword) {
    const words = extractMeaningfulWords(keyword);
    const intentTerms = detectProductIntent(keyword);
    const budget = extractBudget(keyword);
    const intentWhere = buildIntentWhere(intentTerms);
    const andConditions = [
        {
            quantity_in_stock: {
                gt: 0,
            },
        },
    ];
    if (intentWhere)
        andConditions.push(intentWhere);
    if (budget) {
        andConditions.push({
            price: {
                lte: Math.round(budget * 1.1),
            },
        });
    }
    if (!intentWhere && words.length) {
        andConditions.push({
            OR: words.flatMap((word) => [
                { variant_name: { contains: word } },
                { products: { product_name: { contains: word } } },
                { products: { brands: { brand_name: { contains: word } } } },
                { products: { categories: { category_name: { contains: word } } } },
                { products: { product_lines: { line_name: { contains: word } } } },
                { product_variant_specs: { some: { spec_value: { contains: word } } } },
            ]),
        });
    }
    const variants = await prisma.product_variants.findMany({
        where: {
            AND: andConditions,
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
        take: 30,
    });
    return variants
        .map((variant) => ({
        variant,
        score: scoreVariantForAi(variant, keyword, budget, intentTerms),
    }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((item) => item.variant);
}
