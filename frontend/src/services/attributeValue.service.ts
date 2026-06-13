import type { CreateProductAttributeValuePayload, UpdateProductAttributeValuePayload } from "@/types/attribute-value.type";
import { api } from "./api";

export const attributeValueService = {
    create: async(payload: CreateProductAttributeValuePayload) => {
        const res = await api.post("/attribute-values", payload);
        return res.data;
    },

    update: async(attributeValueId: string, payload: UpdateProductAttributeValuePayload) => {
        const res = await api.patch(`/attribute-values/${attributeValueId}`, payload);
        return res.data;
    },

    remove: async(attributeValueId: string) => {
        const res = await api.delete(`/attribute-values/${attributeValueId}`);
        return res.data;
    },
};