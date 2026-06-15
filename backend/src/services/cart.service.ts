import {
    clearCartByUserId,
    createCart,
    createCartItem,
    deleteCartItem,
    findCartByUserId,
    findCartItem,
    findCartItemById,
    findVariantForCart,
    updateCartItemQuantity,
} from "#models/cart.model";
import type { AddCartItemPayload, UpdateCartItemPayload } from "#types/cart.type";
import AppError from "#utils/AppError";
import crypto from "crypto";

const getAvailableQuantity = (variant: any) => {
    return Number(variant.quantity_in_stock) - Number(variant.reserved_quantity ?? 0);
};

const getActivePromotion = (product: any) => {
    const now = new Date();

    return product.products_promotions
        ?.map((item: any) => item.promotions)
        ?.filter((promotion: any) => {
            return new Date(promotion.start_date) <= now && new Date(promotion.end_date) >= now;
        })?.[0];
};

const calculatePrice = (variant: any) => {
    const originalPrice = Number(variant.price);
    const promotion = getActivePromotion(variant.products);

    if(!promotion) return originalPrice;

    const discountValue = Number(promotion.discount_value);

    if(promotion.discount_type === "PERCENT") {
        return Math.max(originalPrice - originalPrice * discountValue / 100, 0);
    }

    return Math.max(originalPrice - discountValue, 0);
};

const ensureCart = async(userId: string) => {
    const existeCart = await findCartByUserId(userId);

    if(existeCart) return existeCart;

    return createCart(userId, crypto.randomUUID());
};

export const getMyCartService = async(userId: string) => {
    const cart = await ensureCart(userId);
    const fullCart = await findCartByUserId(userId);

    const items = fullCart?.carts_items ?? [];

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        return sum + Number(item.price_at_add) * item.quantity;
    }, 0);

    return {
        cart: {
            ...fullCart,
            totalQuantity,
            totalPrice,
        },
    };
};

export const addCartItemService = async(
    userId: string,
    payload: AddCartItemPayload,
) => {
    const cart = await ensureCart(userId);

    const variant = await findVariantForCart(payload.variantId);

    if(!variant) throw new AppError("Biến thể sản phẩm không tồn tại.", 404);

    const avaiableQuantity = getAvailableQuantity(variant);

    if(avaiableQuantity <= 0) {
        throw new AppError("Sản phẩm đã hết hàng.", 400);
    }

    const existedItem = await findCartItem(cart.cart_id, payload.variantId);
    const nextQuantity = (existedItem?.quantity ?? 0) + payload.quantity;

    if(nextQuantity > avaiableQuantity) {
        throw new AppError(`Chỉ còng ${avaiableQuantity} sản phẩm trong kho.`, 400);
    }

    if(existedItem) {
        const updateItem = await updateCartItemQuantity(existedItem.cart_item_id, nextQuantity);
        return {cartItem: updateItem};
    }

    const cartItem = await createCartItem({
        cart_item_id: crypto.randomUUID(),
        cart_id: cart.cart_id,
        variant_id: payload.variantId,
        quantity: payload.quantity,
        price_at_add: calculatePrice(variant),
    });

    return { cartItem };
};

export const updateCartItemService = async (
    userId: string,
    cartItemId: string,
    payload: UpdateCartItemPayload,
) => {
    const cartItem = await findCartItemById(cartItemId);

    if (!cartItem || cartItem.carts.user_id !== userId) {
        throw new AppError("Sản phẩm trong giỏ hàng không tồn tại.", 404);
    }

    const variant = await findVariantForCart(cartItem.variant_id);

    if (!variant) {
        throw new AppError("Biến thể sản phẩm không tồn tại.", 404);
    }

    const availableQuantity = getAvailableQuantity(variant);

    if (payload.quantity > availableQuantity) {
        throw new AppError(`Chỉ còn ${availableQuantity} sản phẩm trong kho.`, 400);
    }

    const updatedItem = await updateCartItemQuantity(cartItemId, payload.quantity);

    return { cartItem: updatedItem };
};

export const deleteCartItemService = async (
    userId: string,
    cartItemId: string,
) => {
    const cartItem = await findCartItemById(cartItemId);

    if (!cartItem || cartItem.carts.user_id !== userId) {
        throw new AppError("Sản phẩm trong giỏ hàng không tồn tại.", 404);
    }

    const deletedItem = await deleteCartItem(cartItemId);

    return { deletedItem };
};

export const clearMyCartService = async (userId: string) => {
    const result = await clearCartByUserId(userId);

    return { deletedCount: result.count };
};