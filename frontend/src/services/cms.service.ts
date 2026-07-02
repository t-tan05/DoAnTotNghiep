import type { BackendSuccess } from "@/types/api.type";
import type {
    CmsCollectionDetailData,
    CmsCollectionListData,
    CmsCollectionListQuery,
    CmsCollectionPayload,
    CmsCollectionRulePayload,
    PublicCmsCollectionData,
    PublicCmsCollectionFiltersData,
    PublicCmsCollectionProductsData,
    CmsSectionItemPayload,
    CmsSectionPayload,
} from "@/types/cms.type";
import { api } from "./api";

export const cmsService = {
    getPublicCollection: async (slug: string) => {
        const res = await api.get<BackendSuccess<PublicCmsCollectionData>>(
            `/cms/collections/public/${encodeURIComponent(slug)}`,
        );

        if(!res.data.data) {
            throw new Error("Không lấy được dữ liệu CMS.");
        }

        return res.data.data;
    },

    getPublicCollectionProducts: async (slug: string, query?: Record<string, unknown>) => {
        const res = await api.get<BackendSuccess<PublicCmsCollectionProductsData>>(
            `/cms/collections/public/${encodeURIComponent(slug)}/products`,
            {
                params: query,
            },
        );

        if(!res.data.data) {
            throw new Error("Không lấy được sản phẩm CMS.");
        }

        return res.data.data;
    },

    getPublicCollectionFilters: async (slug: string) => {
        const res = await api.get<BackendSuccess<PublicCmsCollectionFiltersData>>(
            `/cms/collections/public/${encodeURIComponent(slug)}/filters`,
        );

        if(!res.data.data) {
            throw new Error("Không lấy được bộ lọc CMS.");
        }

        return res.data.data;
    },

    getAdminCollections: async (query: CmsCollectionListQuery) => {
        const res = await api.get<BackendSuccess<CmsCollectionListData>>(
            "/cms/admin/collections",
            {
                params: query,
            },
        );

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách collections.");
        }

        return res.data.data;
    },

    getAdminCollectionDetail: async (collectionId: string) => {
        const res = await api.get<BackendSuccess<CmsCollectionDetailData>>(
            `/cms/admin/collections/${collectionId}`,
        );

        if(!res.data.data) {
            throw new Error("Không lấy được chi tiết collection.");
        }

        return res.data.data;
    },

    createCollection: async (payload: CmsCollectionPayload) => {
        const res = await api.post("/cms/admin/collections", payload);
        return res.data;
    },

    updateCollection: async (collectionId: string, payload: CmsCollectionPayload) => {
        const res = await api.patch(`/cms/admin/collections/${collectionId}`, payload);
        return res.data;
    },

    removeCollection: async (collectionId: string) => {
        const res = await api.delete(`/cms/admin/collections/${collectionId}`);
        return res.data;
    },

    createSection: async (collectionId: string, payload: CmsSectionPayload) => {
        const res = await api.post(`/cms/admin/collections/${collectionId}/sections`, payload);
        return res.data;
    },

    updateSection: async (sectionId: string, payload: CmsSectionPayload) => {
        const res = await api.patch(`/cms/admin/sections/${sectionId}`, payload);
        return res.data;
    },

    removeSection: async (sectionId: string) => {
        const res = await api.delete(`/cms/admin/sections/${sectionId}`);
        return res.data;
    },

    createSectionItem: async (sectionId: string, payload: CmsSectionItemPayload) => {
        const res = await api.post(`/cms/admin/sections/${sectionId}/items`, payload);
        return res.data;
    },

    updateSectionItem: async (itemId: string, payload: CmsSectionItemPayload) => {
        const res = await api.patch(`/cms/admin/items/${itemId}`, payload);
        return res.data;
    },

    removeSectionItem: async (itemId: string) => {
        const res = await api.delete(`/cms/admin/items/${itemId}`);
        return res.data;
    },

    createRule: async (collectionId: string, payload: CmsCollectionRulePayload) => {
        const res = await api.post(`/cms/admin/collections/${collectionId}/rules`, payload);
        return res.data;
    },

    updateRule: async (ruleId: string, payload: CmsCollectionRulePayload) => {
        const res = await api.patch(`/cms/admin/rules/${ruleId}`, payload);
        return res.data;
    },

    removeRule: async (ruleId: string) => {
        const res = await api.delete(`/cms/admin/rules/${ruleId}`);
        return res.data;
    },
};
