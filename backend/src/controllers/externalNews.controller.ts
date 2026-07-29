import {
    getExternalNewsDetailService,
    getExternalNewsService,
    getExternalNewsSourcesService,
    importExternalNewsService,
} from "#services/externalNews.service";
import type { ExternalNewsSourceId } from "#types/externalNews.type";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import { blog_posts_status } from "@prisma/client";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

function parseLimit(value: unknown) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 20;
    return Math.min(Math.max(parsed, 1), 50);
}

export const getExternalNewsSourcesController = CatchAsync(async (_req: Request, res: Response) => {
    const data = getExternalNewsSourcesService();

    res.status(200).json({
        success: true,
        message: "Lấy danh sách nguồn tin thành công",
        data,
    });
});

export const getExternalNewsController = CatchAsync(async (req: Request, res: Response) => {
    const data = await getExternalNewsService({
        sourceId: typeof req.query.sourceId === "string" ? req.query.sourceId : undefined,
        search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
        limit: parseLimit(req.query.limit),
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách tin ngoài thành công",
        data,
    });
});

export const getExternalNewsDetailController = CatchAsync(async (req: Request, res: Response) => {
    if (typeof req.query.url !== "string" || !req.query.url.trim()) {
        throw new AppError("URL bài viết là bắt buộc.", 400);
    }

    const data = await getExternalNewsDetailService(
        req.query.url.trim(),
        typeof req.query.sourceId === "string" ? req.query.sourceId : undefined,
    );

    res.status(200).json({
        success: true,
        message: "Lấy chi tiết tin ngoài thành công",
        data,
    });
});

export const importExternalNewsController = CatchAsync(async (req: AuthRequest, res: Response) => {
    const data = await importExternalNewsService(req.user.user_id, {
        url: req.body.url,
        sourceId: req.body.sourceId as ExternalNewsSourceId | undefined,
        status: req.body.status as blog_posts_status | undefined,
    });

    res.status(201).json({
        success: true,
        message: "Import tin ngoài thành blog thành công",
        data,
    });
});
