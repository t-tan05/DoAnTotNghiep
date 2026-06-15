import redisClient from "#config/redis";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "#config/jwt";
import { findUserById } from "#models/user.model";
export const VerifyToken = CatchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Bạn chưa đăng nhập, vui lòng đăng nhập", 401);
    }
    const token = authHeader.split(" ")[1];
    //kiểm tra blacklist
    const isBlacklist = await redisClient.exists(`blacklist:${token}`);
    if (isBlacklist)
        throw new AppError("Bạn đã đăng xuất", 401);
    const decoded = jwt.verify(token, ACCESS_TOKEN, {
        algorithms: ["HS512"],
    });
    if (!decoded.user_id) {
        throw new AppError("Token không hợp lệ", 401);
    }
    const currentUser = await findUserById(decoded.user_id);
    if (!currentUser) {
        throw new AppError("Người dùng không tồn tại", 401);
    }
    const isAllowedBeforePasswordChange = (req.method === "GET" && req.originalUrl.includes("/api/users/me")) ||
        req.originalUrl.includes("/api/users/me/password") ||
        req.originalUrl.includes("/api/auth/logout");
    if (currentUser.must_change_password && !isAllowedBeforePasswordChange) {
        throw new AppError("Vui lòng đổi mật khẩu trước khi tiếp tục", 403);
    }
    req.user = {
        ...decoded,
        mustChangePassword: Boolean(currentUser.must_change_password),
    };
    next();
});
