import type { BackendSuccess } from "@/types/api.type";
import type { BlogDetailData, BlogListData, BlogListQuery, BlogPayload } from "@/types/blog.type";
import { api } from "./api";

export const blogService = {
    getPublic: async (query: BlogListQuery) => {
        const res = await api.get<BackendSuccess<BlogListData>>("/blogs/public", {
            params: query,
        });

        return res.data.data;
    },

    getPublicById: async (postId: string) => {
        const res = await api.get<BackendSuccess<BlogDetailData>>(`/blogs/public/${postId}`);
        return res.data.data;
    },

    getAdmin: async (query: BlogListQuery) => {
        const res = await api.get<BackendSuccess<BlogListData>>("/blogs/admin", {
            params: query,
        });

        return res.data.data;
    },

    getAdminById: async (postId: string) => {
        const res = await api.get<BackendSuccess<BlogDetailData>>(`/blogs/admin/${postId}`);
        return res.data.data;
    },

    create: async (payload: BlogPayload) => {
        const res = await api.post("/blogs", payload);
        return res.data;
    },

    update: async (postId: string, payload: BlogPayload) => {
        const res = await api.patch(`/blogs/${postId}`, payload);
        return res.data;
    },

    remove: async (postId: string) => {
        const res = await api.delete(`/blogs/${postId}`);
        return res.data;
    },
};