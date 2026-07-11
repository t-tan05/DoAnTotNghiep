import redisClient from "#config/redis";
import { ACCESS_TOKEN } from "#config/jwt";
import { findUserById } from "#models/user.model";
import { getAdminStatisticsService, getDashboardSummaryAnalyticsService, } from "#services/dashboardAnalytics.service";
import { trackPageView } from "#utils/dashboardMetrics";
import { CatchAsync } from "#utils/CatchAsync";
import jwt from "jsonwebtoken";
import { emitDashboardUpdate } from "../socket.js";
const statisticPresets = new Set([
    "today",
    "last7days",
    "thisMonth",
    "lastMonth",
    "thisYear",
    "custom",
]);
async function getOptionalUserId(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return null;
    const token = authHeader.split(" ")[1];
    try {
        const isBlacklist = await redisClient.exists(`blacklist:${token}`);
        if (isBlacklist)
            return null;
        const decoded = jwt.verify(token, ACCESS_TOKEN, {
            algorithms: ["HS512"],
        });
        if (!decoded.user_id)
            return null;
        const user = await findUserById(decoded.user_id);
        return user?.user_id || null;
    }
    catch {
        return null;
    }
}
export const getDashboardSummaryController = CatchAsync(async (req, res) => {
    const data = await getDashboardSummaryAnalyticsService({
        intervalMinutes: Number(req.query.intervalMinutes) || undefined,
        lowStockThreshold: Number(req.query.lowStockThreshold) || undefined,
        lowStockPage: Number(req.query.lowStockPage) || undefined,
        lowStockLimit: Number(req.query.lowStockLimit) || undefined,
    });
    res.status(200).json({
        success: true,
        message: "Lấy dữ liệu dashboard thành công.",
        data,
    });
});
export const getAdminStatisticsController = CatchAsync(async (req, res) => {
    const preset = typeof req.query.preset === "string" && statisticPresets.has(req.query.preset)
        ? req.query.preset
        : undefined;
    const data = await getAdminStatisticsService({
        preset,
        fromDate: typeof req.query.fromDate === "string" ? req.query.fromDate : undefined,
        toDate: typeof req.query.toDate === "string" ? req.query.toDate : undefined,
    });
    res.status(200).json({
        success: true,
        message: "Lấy dữ liệu thống kê thành công.",
        data,
    });
});
export const trackPageViewController = CatchAsync(async (req, res) => {
    const userId = await getOptionalUserId(req);
    trackPageView({
        path: typeof req.body?.path === "string" ? req.body.path : req.headers.referer,
        userId,
    });
    emitDashboardUpdate();
    res.status(204).send();
});
