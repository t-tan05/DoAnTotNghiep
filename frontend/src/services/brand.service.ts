import type { BrandListData, BrandListQuery, BrandPayload } from "@/types/brand.type";
import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";

export const brandService = {
    getAll: async(query: BrandListQuery) => {
        const res = await api.get<BackendSuccess<BrandListData>>("/brands", {
            params: query,
        });

        return res.data.data;
    },

    create: async(payload: BrandPayload) => {
        const res = await api.post("/brands", payload);
        return res.data;
    },

    update: async(brandId: string, payload: BrandPayload) => {
        const res = await api.patch(`/brands/${brandId}`, payload);
        return res.data;
    },

    remove: async(brandId: string) => {
        const res = await api.delete(`/brands/${brandId}`);
        return res.data;
    }
}