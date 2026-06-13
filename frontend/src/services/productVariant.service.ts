import type { CreateProductVariantPayload, UpdateProductVariantPayload } from "@/types/productVariant.type";
import { api } from "./api";

export const productVariantService = {
    create: async(productId: string, payload: CreateProductVariantPayload | FormData) => {
        const res = await api.post(`/product-variants/${productId}`, payload, {
            headers: payload instanceof FormData 
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
        });

        return res.data;
    },

    update: async(variantId: string, payload: UpdateProductVariantPayload) => {
        const res = await api.patch(`/product-variants/${variantId}`, payload);
        return res.data;
    },

    remove: async(variantId: string) => {
        const res = await api.delete(`/product-variants/${variantId}`);
        return res.data;
    },

    getById: async(variantId: string) => {
        const res = await api.get(`/product-variants/${variantId}`);
        return res.data.data;
    },
};