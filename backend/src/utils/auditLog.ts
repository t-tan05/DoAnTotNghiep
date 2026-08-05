import type { Request } from "express";
import logger from "#config/logger";

export function auditLog(req: Request, action: string, metadata?: Record<string, unknown>) {
    const user = (req as any).user;

    logger.info({
        type: "audit",
        action,
        userId: user?.user_id ?? null,
        requestId: (req as any).id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        metadata,
    }, `AUDIT ${action}`);
}
