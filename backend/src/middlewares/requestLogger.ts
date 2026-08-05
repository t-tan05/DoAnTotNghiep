import crypto from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import { pinoHttp } from "pino-http";
import logger from "#config/logger";

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req: IncomingMessage) => {
        const requestId = req.headers["x-request-id"];

        if(typeof requestId === "string" && requestId.trim()) {
            return requestId;
        }

        return crypto.randomUUID();
    },
    customProps: (req: IncomingMessage) => {
        const user = (req as any).user;

        return {
            userId: user?.user_id ?? null,
        };
    },
    customLogLevel: (req: IncomingMessage, res: ServerResponse, err?: Error) => {
        if(err || res.statusCode >= 500) return "error";
        if(res.statusCode >= 400) return "warn";
        return "info";
    },
    serializers: {
        req(req: any) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                remoteAddress: req.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
        },
        res(res: any) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});
