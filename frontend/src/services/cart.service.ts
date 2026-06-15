import type { BackendSuccess } from "@/types/api.type";
import type {
    AddCartItemPayload,
    CartData,
    UpdateCartItemPayload,
} from "@/types/cart.type";
import { api } from "./api";

export const cartService = {
    getMyCart: async() => {
        const res = await api.get<BackendSuccess<CartData>>("/carts/me");
        return res.data.data;
    },

    addItem: async(payload: AddCartItemPayload) => {
        const res = await api.post("/carts/items",payload);
        return res.data;
    },

    updateItem: async(cartItemId: string, payload: UpdateCartItemPayload) => {
        const res = await api.patch(`/carts/items/${cartItemId}`, payload);
        return res.data;
    },

    removeItem: async(cartItemId: string) => {
        const res = await api.delete(`/carts/items/${cartItemId}`);
        return res.data;
    },

    clearCart: async () => {
        const res = await api.delete("/carts/me");
        return res.data;
    },
};