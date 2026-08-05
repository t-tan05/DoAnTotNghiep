import crypto from "crypto";
import { pinoHttp } from "pino-http";
import logger from "#config/logger";
export const requestLogger = pinoHttp({
    logger,
    genReqId: (req) => {
        const requestId = req.headers["x-request-id"];
        if (typeof requestId === "string" && requestId.trim()) {
            return requestId;
        }
        return crypto.randomUUID();
    },
    customProps: (req) => {
        const user = req.user;
        return {
            userId: user?.user_id ?? null,
        };
    },
    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500)
            return "error";
        if (res.statusCode >= 400)
            return "warn";
        return "info";
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                remoteAddress: req.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});
