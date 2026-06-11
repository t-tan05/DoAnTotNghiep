import type { CategoryListData, CategoryListQuery, CategoryPayload } from "@/types/category.type";
import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";

export const categoryService = {
    getAll: async(query: CategoryListQuery) => {
        const res = await api.get<BackendSuccess<CategoryListData>>("/categories", {
            params: query,
        });

        return res.data.data;
    },

    create: async(payload: CategoryPayload) => {
        const res = await api.post("/categories", payload);
        return res.data;
    },

    update: async(categoryId: string, payload: CategoryPayload) => {
        const res = await api.patch(`/categories/${categoryId}`, payload);
        return res.data;
    },

    remove: async(categoryId: string) => {
        const res = await api.delete(`/categories/${categoryId}`);
        return res.data;
    }
}