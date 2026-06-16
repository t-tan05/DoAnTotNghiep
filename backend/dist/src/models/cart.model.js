import prisma from "#config/prisma";
export const findCartByUserId = async (userId) => {
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
export const createCart = async (userId, cartId) => {
    return prisma.carts.create({
        data: {
            cart_id: cartId,
            user_id: userId,
        },
    });
};
export const findCartItem = async (cartId, variantId) => {
    return prisma.carts_items.findUnique({
        where: {
            cart_id_variant_id: {
                cart_id: cartId,
                variant_id: variantId,
            },
        },
    });
};
export const findCartItemById = async (cartItemId) => {
    return prisma.carts_items.findUnique({
        where: {
            cart_item_id: cartItemId,
        },
        include: {
            carts: true,
        },
    });
};
export const createCartItem = async (data) => {
    return prisma.carts_items.create({ data });
};
export const updateCartItemQuantity = async (cartItemId, quantity) => {
    return prisma.carts_items.update({
        where: {
            cart_item_id: cartItemId,
        },
        data: {
            quantity,
        },
    });
};
export const deleteCartItem = async (cartItemId) => {
    return prisma.carts_items.delete({
        where: {
            cart_item_id: cartItemId,
        },
    });
};
export const clearCartByUserId = async (userId) => {
    return prisma.carts_items.deleteMany({
        where: {
            carts: {
                user_id: userId,
            },
        },
    });
};
export const findVariantForCart = async (variantId) => {
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
