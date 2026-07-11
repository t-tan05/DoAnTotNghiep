import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "#config/redis";
import { ACCESS_TOKEN } from "#config/jwt";
import { findUserById } from "#models/user.model";

export interface OptionalAuthRequest extends Request {
    user?: any;
}

export async function OptionalAuth(req: OptionalAuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        const isBlacklist = await redisClient.exists(`blacklist:${token}`);

        if(isBlacklist) return next();

        const decoded = jwt.verify(token, ACCESS_TOKEN as string, {
            algorithms: ["HS512"],
        }) as jwt.JwtPayload;

        if(!decoded.user_id) return next();

        const currentUser = await findUserById(decoded.user_id);
        if(!currentUser) return next();

        req.user = decoded;
        next();
    } catch {
        next();
    }
}