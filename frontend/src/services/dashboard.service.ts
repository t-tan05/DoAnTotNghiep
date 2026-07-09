import { api } from "@/services/api";
import type { BackendSuccess } from "@/types/api.type";
import type { AdminStatistics, DashboardSummary, StatisticsFilterPreset } from "@/types/dashboard.type";

export const dashboardService = {
    getSummary: async(params?: {
        intervalMinutes?: number;
        lowStockThreshold?: number;
        lowStockPage?: number;
        lowStockLimit?: number;
    }) => {
        const res = await api.get<BackendSuccess<DashboardSummary>>("/dashboard/admin/summary", {
            params,
        });

        if(!res.data.data) {
            throw new Error("Không lấy được dữ liệu dashboard.");
        }

        return res.data.data;
    },

    getStatistics: async(params?: {
        preset?: StatisticsFilterPreset;
        fromDate?: string;
        toDate?: string;
    }) => {
        const res = await api.get<BackendSuccess<AdminStatistics>>("/dashboard/admin/statistics", {
            params,
        });

        if(!res.data.data) {
            throw new Error("Không lấy được dữ liệu thống kê.");
        }

        return res.data.data;
    },

    trackPageView: async(path: string) => {
        await api.post("/dashboard/track", {
            path,
        });
    },
};
