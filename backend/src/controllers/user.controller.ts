import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";
import { delUserService, getAllUsersService, lockUserService, profileService, unlockUserService, updateProfileService } from "#services/user.service";
import AppError from "#utils/AppError";

interface AuthRequest extends Request {
    user?: any;
}

export const getAllUsersController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAllUsersService();

    res.status(200).json({
        success: true,
        message: "Lấy danh sách users thành công",
        data: {
            ...data
        }
    })
});

export const profileController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;

    const data = await profileService(userId);

    res.status(200).json({
        success: true,
        message: "Thông tin cá nhân",
        ...data,
    });
});

export const updateProfileController = CatchAsync(async(req: AuthRequest, res: Response) => {

    const {name} = req.body;

    const userId = req.user.user_id;

    const data = await updateProfileService(userId, name);

    res.status(200).json({
        success: true,
        message: "Đã cập nhật thành công",
        ...data,
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
        ...data,
    });
});

export const unlockUserController = CatchAsync(async(req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if(!userId) throw new AppError("Thiếu userId", 400);

    const data = await unlockUserService(userId);

    res.status(200).json({
        success: true,
        message: "Mở khóa tài khoản thành công",
        ...data,
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

