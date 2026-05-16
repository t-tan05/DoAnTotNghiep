import { Request, Response, NextFunction } from "express";
import AppError from "#utils/AppError";

// Giả định bạn đã đính kèm user vào request sau khi verify token
interface AuthenticatedRequest extends Request {
    user?: any;
}

export const CheckRole = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const userRoles: string[] = req.user?.roles || [];

        const hasRole = userRoles.some((role) => roles.includes(role));

        if (!hasRole) {
            throw new AppError("Forbidden: Bạn không có quyền truy cập", 403);
        }
        next();
    };
};