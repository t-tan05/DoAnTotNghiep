import type {
    AttachProductsToPromotionPayload,
    CreatePromotionPayload,
    PromotionListData,
    UpdatePromotionPayload,
} from "@/types/promotion.type";
import type { BackendSuccess } from "@/types/api.type";
import { api } from "./api";

export const promotionService = {
    getAll: async () => {
        const res = await api.get<BackendSuccess<PromotionListData>>("/promotions");
        return res.data.data;
    },

    getById: async (promotionId: string) => {
        const res = await api.get(`/promotions/${promotionId}`);
        return res.data.data;
    },

    create: async (payload: CreatePromotionPayload) => {
        const res = await api.post("/promotions", payload);
        return res.data;
    },

    update: async (promotionId: string, payload: UpdatePromotionPayload) => {
        const res = await api.patch(`/promotions/${promotionId}`, payload);
        return res.data;
    },

    remove: async (promotionId: string) => {
        const res = await api.delete(`/promotions/${promotionId}`);
        return res.data;
    },

    updateProducts: async (
        promotionId: string,
        payload: AttachProductsToPromotionPayload,
    ) => {
        const res = await api.post(`/promotions/${promotionId}/products`, payload);
        return res.data;
    },

    removeProduct: async (promotionId: string, productId: string) => {
        const res = await api.delete(`/promotions/${promotionId}/products/${productId}`);
        return res.data;
    },
};