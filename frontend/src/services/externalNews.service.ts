import type { BackendSuccess } from "@/types/api.type";
import type {
    ExternalNewsDetailData,
    ExternalNewsListData,
    ExternalNewsSourceId,
    ExternalNewsSourcesData,
    ImportExternalNewsData,
    ImportExternalNewsPayload,
} from "@/types/externalNews.type";
import { api } from "./api";

export const externalNewsService = {
    getSources: async () => {
        const res = await api.get<BackendSuccess<ExternalNewsSourcesData>>("/external-news/sources");
        return res.data.data;
    },

    getArticles: async (params: {
        sourceId?: ExternalNewsSourceId;
        search?: string;
        limit?: number;
    }) => {
        const res = await api.get<BackendSuccess<ExternalNewsListData>>("/external-news", {
            params,
        });

        return res.data.data;
    },

    getDetail: async (params: {
        url: string;
        sourceId?: ExternalNewsSourceId;
    }) => {
        const res = await api.get<BackendSuccess<ExternalNewsDetailData>>("/external-news/detail", {
            params,
        });

        return res.data.data;
    },

    importToBlog: async (payload: ImportExternalNewsPayload) => {
        const res = await api.post<BackendSuccess<ImportExternalNewsData>>("/external-news/import", payload);
        return res.data.data;
    },
};
