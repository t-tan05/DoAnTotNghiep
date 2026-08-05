import logger from "#config/logger";
export function auditLog(req, action, metadata) {
    const user = req.user;
    logger.info({
        type: "audit",
        action,
        userId: user?.user_id ?? null,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        metadata,
    }, `AUDIT ${action}`);
}
