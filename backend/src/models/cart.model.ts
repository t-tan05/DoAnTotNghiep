import prisma from "#config/prisma";
import { Prisma } from "@prisma/client";

export const findCartByUserId = async (userId: string) => {
    return prisma.carts.findUnique({
        where: {
            user_id: userId,
        },
        include: {
            carts_items: {
                include: {
                    product_variants: {
                        include: {
                            products: {
                                include: {
                                    brands: true,
                                    categories: true,
                                    products_promotions: {
                                        include: {
                                            promotions: true,
                                        },
                                    },
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
                orderBy: {
                    cart_item_id: "desc",
                },
            },
        },
    });
};

export const createCart = async (userId: string, cartId: string) => {
    return prisma.carts.create({
        data: {
            cart_id: cartId,
            user_id: userId,
        },
    });
};

export const findCartItem = async (cartId: string, variantId: string) => {
    return prisma.carts_items.findUnique({
        where: {
            cart_id_variant_id: {
                cart_id: cartId,
                variant_id: variantId,
            },
        },
    });
};

export const findCartItemById = async (cartItemId: string) => {
    return prisma.carts_items.findUnique({
        where: {
            cart_item_id: cartItemId,
        },
        include: {
            carts: true,
        },
    });
};

export const createCartItem = async (data: Prisma.carts_itemsUncheckedCreateInput) => {
    return prisma.carts_items.create({ data });
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    return prisma.carts_items.update({
        where: {
            cart_item_id: cartItemId,
        },
        data: {
            quantity,
        },
    });
};

export const deleteCartItem = async (cartItemId: string) => {
    return prisma.carts_items.delete({
        where: {
            cart_item_id: cartItemId,
        },
    });
};

export const clearCartByUserId = async (userId: string) => {
    return prisma.carts_items.deleteMany({
        where: {
            carts: {
                user_id: userId,
            },
        },
    });
};

export const findVariantForCart = async (variantId: string) => {
    return prisma.product_variants.findUnique({
        where: {
            variant_id: variantId,
        },
        include: {
            products: {
                include: {
                    products_promotions: {
                        include: {
                            promotions: true,
                        },
                    },
                },
            },
        },
    });
};