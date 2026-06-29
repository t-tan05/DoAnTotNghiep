import type { BackendSuccess } from "@/types/api.type";
import type {
    WishlistCheckManyResponse,
    WishlistCheckResponse,
    WishlistMutationResponse,
    WishlistResponse,
} from "@/types/wishlist.type";
import { api } from "./api";

export const wishlistService = {
    getMyWishlists: async(page = 1, limit = 8) => {
        const res = await api.get<BackendSuccess<WishlistResponse>>("/wishlists/me", {
            params: {
                page,
                limit,
            },
        });

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách sản phẩm yêu thích.");
        }

        return res.data.data;
    },

    check: async(variantId: string) => {
        const res = await api.get<BackendSuccess<WishlistCheckResponse>>(
            `/wishlists/check/${variantId}`,
        );

        return res.data.data;
    },

    checkMany: async(variantIds: string[]) => {
        const res = await api.post<BackendSuccess<WishlistCheckManyResponse>>(
            "/wishlists/check-many",
            {
                variantIds,
            },
        );

        return res.data.data;
    },

    add: async(variantId: string) => {
        const res = await api.post<BackendSuccess<WishlistMutationResponse>>(
            `/wishlists/${variantId}`,
        );

        return res.data.data;
    },

    remove: async(variantId: string) => {
        const res = await api.delete<BackendSuccess<WishlistMutationResponse>>(
            `/wishlists/${variantId}`,
        );

        return res.data.data;
    },
};
