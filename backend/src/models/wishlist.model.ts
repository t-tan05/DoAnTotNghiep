import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findWishlistByUserAndVariant = async(userId: string, variantId: string) => {
    return await prisma.wishlists.findUnique({
        where: {
            user_id_variant_id: {
                user_id: userId,
                variant_id: variantId,
            },
        },
    });
};

export const findWishlistsByUserAndVariants = async(userId: string, variantIds: string[]) => {
    return await prisma.wishlists.findMany({
        where: {
            user_id: userId,
            variant_id: {
                in: variantIds,
            },
        },
        select: {
            variant_id: true,
        },
    });
};

export const createWishlist = async(data: Prisma.wishlistsUncheckedCreateInput) => {
    return await prisma.wishlists.create({
        data,
    });
};

export const deleteWishlistByUserAndVariant = async(userId: string, variantId: string) => {
    return await prisma.wishlists.delete({
        where: {
            user_id_variant_id: {
                user_id: userId,
                variant_id: variantId,
            },
        },
    });
};

export const getWishlistsByUserId = async(userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [wishlists, totalItems] = await prisma.$transaction([
        prisma.wishlists.findMany({
            where: {
                user_id: userId,
            },
            skip,
            take: limit,
            orderBy: {
                created_at: "desc",
            },
            include: {
                product_variants: {
                    include: {
                        products: {
                            include: {
                                brands: true,
                                categories: true,
                            },
                        },
                        product_images: {
                            orderBy: {
                                is_default: "desc",
                            },
                        },
                        variant_attribute_values: {
                            include: {
                                attribute_values: {
                                    include: {
                                        product_attributes: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),

        prisma.wishlists.count({
            where: {
                user_id: userId,
            },
        }),
    ]);

    return {
        wishlists,
        totalItems,
    };
};

export const findVariantByIdForWishlist = async(variantId: string) => {
    return await prisma.product_variants.findUnique({
        where: {
            variant_id: variantId,
        },
        select: {
            variant_id: true,
        },
    });
};
