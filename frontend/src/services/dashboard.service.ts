import { api } from "@/services/api";
import type { BackendSuccess } from "@/types/api.type";
import type { DashboardSummary } from "@/types/dashboard.type";

export const dashboardService = {
    getSummary: async(params?: {
        intervalMinutes?: number;
        lowStockThreshold?: number;
    }) => {
        const res = await api.get<BackendSuccess<DashboardSummary>>("/dashboard/admin/summary", {
            params,
        });

        if(!res.data.data) {
            throw new Error("Không lấy được dữ liệu dashboard.");
        }

        return res.data.data;
    },

    trackPageView: async(path: string) => {
        await api.post("/dashboard/track", {
            path,
        });
    },
};
