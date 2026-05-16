import redisClient from "#config/redis";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "#config/jwt";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const VerifyToken = CatchAsync(async(req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new AppError("Bạn chưa đăng nhập, vui lòng đăng nhập", 401);
    }

    const token = authHeader.split(" ")[1];

    //kiểm tra blacklist
    const isBlacklist = await redisClient.exists(`blacklist:${token}`);

    if(isBlacklist) throw new AppError("Bạn đã đăng xuất", 401);

    const decoded = jwt.verify(token, ACCESS_TOKEN as string, {
        algorithms: ["HS512"],
    });

    req.user = decoded;
    next();
})
