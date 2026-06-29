import { createWishlist, deleteWishlistByUserAndVariant, findVariantByIdForWishlist, findWishlistByUserAndVariant, findWishlistsByUserAndVariants, getWishlistsByUserId } from "#models/wishlist.model";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import crypto from "crypto";

export const getMyWishlistsService = async(userId: string, page = 1, limit = 10) => {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const {wishlists, totalItems} = await getWishlistsByUserId(
        userId,
        safePage,
        safeLimit,
    );

    return {
        wishlists,
        meta: {
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalItems,
                totalPages: Math.max(Math.ceil(totalItems / safeLimit), 1),
            },
        },
    };
};

export const addWishlistService = async(userId: string, variantId: string) => {
    const variant = await findVariantByIdForWishlist(variantId);

    if(!variant) {
        throw new AppError("Biến thể sản phẩm không tồn tại.", 404);
    }

    const existedWishlist = await findWishlistByUserAndVariant(userId, variantId);

    if(existedWishlist) {
        return {
            wishlist: existedWishlist,
            isWishlisted: true,
        }
    }

    const wishlist = await createWishlist({
        wishlist_id: crypto.randomUUID(),
        user_id: userId,
        variant_id: variantId,
    });

    return {
        wishlist,
        isWishlisted: true,
    };
};

export const removeWishlistService = async(userId: string, variantId: string) => {
    const existedWishlist = await findWishlistByUserAndVariant(userId, variantId);

    if(!existedWishlist) {
        return {
            isWishlisted: false,
        };
    }

    await deleteWishlistByUserAndVariant(userId, variantId);

    return {
        isWishlisted: false,
    };
};

export const checkWishlistService = async(userId: string, variantId: string) => {
    const wishlist = await findWishlistByUserAndVariant(userId, variantId);

    return {
        isWishlisted: Boolean(wishlist),
    };
};

export const checkManyWishlistsService = async(userId: string, variantIds: string[]) => {
    const uniqueVariantIds = Array.from(new Set(variantIds.filter(Boolean)));

    if(uniqueVariantIds.length === 0) {
        return {
            items: {},
        };
    }

    const wishlists = await findWishlistsByUserAndVariants(userId, uniqueVariantIds);
    const wishlistedVariantIds = new Set(wishlists.map((wishlist) => wishlist.variant_id));

    return {
        items: uniqueVariantIds.reduce<Record<string, boolean>>((result, variantId) => {
            result[variantId] = wishlistedVariantIds.has(variantId);
            return result;
        }, {}),
    };
};
