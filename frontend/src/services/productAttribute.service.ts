import type { BackendSuccess } from "@/types/api.type"
import type { ProductAttributeListData, ProductAttributePayload, ProductAttributeUpdatePayload } from "@/types/product-attribute.type"
import { api } from "./api";

export const productAttributeService = {
    getAll: async() => {
        const res = await api.get<BackendSuccess<ProductAttributeListData>>("/product-attributes");
        return res.data.data;
    },

    create: async(payload: ProductAttributePayload) => {
        const res = await api.post("/product-attributes", payload);
        return res.data;
    },

    update: async(attributeId: string, payload: ProductAttributeUpdatePayload) => {
        const res = await api.patch(`/product-attributes/${attributeId}`, payload);
        return res.data;
    },

    remove: async(attributeId: string) => {
        const res = await api.delete(`/product-attributes/${attributeId}`);
        return res.data;
    },
};
