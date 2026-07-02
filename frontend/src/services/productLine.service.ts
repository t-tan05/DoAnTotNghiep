import type { BackendSuccess } from "@/types/api.type";
import type {
    ProductLineDetailData,
    ProductLineListData,
    ProductLineListQuery,
    ProductLinePayload,
} from "@/types/product-line.type";
import { api } from "./api";

export const productLineService = {
    getAll: async(query: ProductLineListQuery) => {
        const res = await api.get<BackendSuccess<ProductLineListData>>(
            "/product-lines",
            {
                params: query,
            },
        );

        return res.data.data;
    },

    getById: async(lineId: string) => {
        const res = await api.get<BackendSuccess<ProductLineDetailData>>(
            `/product-lines/${lineId}`,
        );

        return res.data.data;
    },

    create: async(payload: ProductLinePayload) => {
        const res = await api.post("/product-lines", payload);
        return res.data;
    },

    update: async(lineId: string, payload: ProductLinePayload) => {
        const res = await api.patch(`/product-lines/${lineId}`, payload);
        return res.data;
    },

    remove: async(lineId: string) => {
        const res = await api.delete(`/product-lines/${lineId}`);
        return res.data;
    },
};
