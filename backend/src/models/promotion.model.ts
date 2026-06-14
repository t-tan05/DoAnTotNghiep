import prisma from "#config/prisma";
import { Prisma } from "@prisma/client";

const promotionInclude = {
    products_promotions: {
        include: {
            products: true,
        },
    },
} satisfies Prisma.promotionsInclude;

export const findAllPromotions = async () => {
    return await prisma.promotions.findMany({
        include: promotionInclude,
        orderBy: {
            start_date: "desc",
        },
    });
};

export const findPromotionById = async (promotionId: string) => {
    return await prisma.promotions.findUnique({
        where: {
            promotion_id: promotionId,
        },
        include: promotionInclude,
    });
};

export const findDuplicatePromotion = async (
    promotionName: string,
    startDate: Date,
    endDate: Date,
    excludedPromotionId?: string,
) => {
    return await prisma.promotions.findFirst({
        where: {
            promotion_name: promotionName,
            start_date: startDate,
            end_date: endDate,
            ...(excludedPromotionId
                ? {
                    promotion_id: {
                        not: excludedPromotionId,
                    },
                }
                : {}),
        },
    });
};

export const refreshPromotionActive = async (promotionId: string, isActive: boolean) => {
    return await prisma.promotions.update({
        where: {
            promotion_id: promotionId,
        },
        data: {
            is_active: isActive,
        },
        include: promotionInclude,
    });
};

export const refreshAllPromotionsActive = async (now: Date) => {
    await prisma.$transaction([
        prisma.promotions.updateMany({
            where: {
                start_date: {
                    lte: now,
                },
                end_date: {
                    gte: now,
                },
                is_active: {
                    not: true,
                },
            },
            data: {
                is_active: true,
            },
        }),
        prisma.promotions.updateMany({
            where: {
                OR: [
                    {
                        start_date: {
                            gt: now,
                        },
                    },
                    {
                        end_date: {
                            lt: now,
                        },
                    },
                ],
                is_active: {
                    not: false,
                },
            },
            data: {
                is_active: false,
            },
        }),
    ]);
};

export const createPromotion = async (
    promotionData: Prisma.promotionsUncheckedCreateInput,
    productIds: string[],
) => {
    return await prisma.$transaction(async (tx) => {
        const promotion = await tx.promotions.create({
            data: promotionData,
        });

        if(productIds.length > 0) {
            await tx.products_promotions.createMany({
                data: productIds.map((productId) => ({
                    product_id: productId,
                    promotion_id: promotion.promotion_id,
                })),
                skipDuplicates: true,
            });
        }

        return promotion;
    });
};

export const updatePromotion = async (
    promotionId: string,
    data: Prisma.promotionsUpdateInput,
) => {
    return await prisma.promotions.update({
        where: {
            promotion_id: promotionId,
        },
        data,
        include: promotionInclude,
    });
};

export const deletePromotion = async (promotionId: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.products_promotions.deleteMany({
            where: {
                promotion_id: promotionId,
            },
        });

        return await tx.promotions.delete({
            where: {
                promotion_id: promotionId,
            },
        });
    });
};

export const attachProductsToPromotion = async (
    promotionId: string,
    productIds: string[],
) => {
    return await prisma.$transaction(async (tx) => {
        await tx.products_promotions.deleteMany({
            where: {
                promotion_id: promotionId,
            },
        });

        if(productIds.length > 0) {
            await tx.products_promotions.createMany({
                data: productIds.map((productId) => ({
                    product_id: productId,
                    promotion_id: promotionId,
                })),
                skipDuplicates: true,
            });
        }

        return await tx.promotions.findUnique({
            where: {
                promotion_id: promotionId,
            },
            include: promotionInclude,
        });
    });
};

export const detachProductFromPromotion = async (
    promotionId: string,
    productId: string,
) => {
    return await prisma.products_promotions.delete({
        where: {
            product_id_promotion_id: {
                product_id: productId,
                promotion_id: promotionId,
            },
        },
    });
};

export const findProductInPromotionByProductId = async(
    promotionId: string, 
    productId: string
) => {
    return await prisma.products_promotions.findUnique({
        where: {
            product_id_promotion_id: {
                product_id: productId,
                promotion_id: promotionId,
            },
        },
    });
};
