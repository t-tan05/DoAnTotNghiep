import AppError from "#utils/AppError";
export const CheckRole = (...roles) => {
    return (req, res, next) => {
        const userRoles = req.user?.roles || [];
        const hasRole = userRoles.some((role) => roles.includes(role));
        if (!hasRole) {
            throw new AppError("Forbidden: Bạn không có quyền truy cập", 403);
        }
        next();
    };
};
