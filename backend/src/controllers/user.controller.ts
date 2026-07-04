import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";
import { 
    createEmpByAdminService, 
    delUserService, 
    getAllUsersService, 
    lockUserService, 
    profileService, 
    unlockUserService, 
    updatePasswordService, 
    updateProfileService 
} from "#services/user.service";
import AppError from "#utils/AppError";
import { UserRoleFilter, UserSortBy, UserStatusFilter } from "#types/user.type";
import { parseListQuery } from "#utils/parseListQuery";

interface AuthRequest extends Request {
    user?: any;
}

const getBooleanQuery = (value: unknown) => {
    if(value === "true") return true;
    if(value === "false") return false;
    return undefined;
};

const getRoleQuery = (value: unknown): UserRoleFilter | undefined => {
    const allowed = ["ADMIN", "EMPLOYEE", "CUSTOMER"];

    return typeof value === "string" && allowed.includes(value)
        ? value as UserRoleFilter
        : undefined;
};

const getStatusQuery = (value: unknown): UserStatusFilter | undefined => {
    const allowed = ["ACTIVE", "LOCKED"];

    return typeof value === "string" && allowed.includes(value)
        ? value as UserStatusFilter
        : undefined;
};

export const getAllUsersController = CatchAsync(async(req: Request, res: Response) => {
    const query = {
        ...parseListQuery<UserSortBy>({
            query: req.query,
            allowedSortFields: ["name", "email", "status", "verified"],
            defaultSortBy: "name",
        }),
        role: getRoleQuery(req.query.role),
        status: getStatusQuery(req.query.status),
        verified: getBooleanQuery(req.query.verified),
        mustChangePassword: getBooleanQuery(req.query.mustChangePassword),
    };

    const data = await getAllUsersService(query);

    res.status(200).json({
        success: true,
        message: "Lấy danh sách users thành công",
        data: {
            ...data
        },
    });
});

export const profileController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;

    const data = await profileService(userId);

    res.status(200).json({
        success: true,
        message: "Thông tin cá nhân",
        data: {
            ...data,
        }
    });
});

export const updateProfileController = CatchAsync(async(req: AuthRequest, res: Response) => {

    const {name} = req.body;

    const userId = req.user.user_id;

    const data = await updateProfileService(userId, name);

    res.status(200).json({
        success: true,
        message: "Đã cập nhật thành công",
        data: {
            ...data,
        }
    });
});

export const lockUserController = CatchAsync(async(req: Request, res: Response) => {
    const  userId  = req.params.userId as string;
    const { reason } = req.body;

    if(!userId) throw new AppError("Thiếu userId", 400);

    const data = await lockUserService(userId, reason);

    res.status(200).json({
        success: true,
        message: "Khóa tài khoản thành công",
        data: {
            ...data,
        }
    });
});

export const unlockUserController = CatchAsync(async(req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if(!userId) throw new AppError("Thiếu userId", 400);

    const data = await unlockUserService(userId);

    res.status(200).json({
        success: true,
        message: "Mở khóa tài khoản thành công",
        data: {
            ...data,
        }
    });
});

export const delUserController = CatchAsync(async(req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if(!userId) throw new AppError("Thiếu userId", 400);

    await delUserService(userId);

    res.status(200).json({
        success: true,
        message: "Xóa tài khoản thành công",
    });
});

export const updatePasswordController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;

    const {currentPassword, newPassword, confirmPassword} = req.body;

    await updatePasswordService(userId, currentPassword, newPassword, confirmPassword);

    res.status(200).json({
        success: true,
        message: "Thay đổi mật khẩu thành công",
    });
});

export const createEmployeeController = CatchAsync(async(req: Request, res: Response) => {
    const {name, email, password, confirmPassword} = req.body;

    const data = await createEmpByAdminService(name, email, password, confirmPassword);

    res.status(201).json({
        success: true,
        message: "Tạo tài khoản nhân viên thành công",
        data: {
            ...data,
        },
    });
});
