import { createRoleService, deleteRoleService, getAllRolesService } from "#services/role.service";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createRoleController = CatchAsync(async(req: Request, res: Response) => {
    const {roleName, description} = req.body;

    const data = await createRoleService(roleName, description);

    res.status(201).json({
        success: true,
        message: "Tạo role thành công",
        data: {
            ...data,
        }
    })
});

export const deleteRoleController = CatchAsync(async(req: Request, res: Response) => {
    const roleName = req.params.roleName as string;

    if(!roleName) throw new AppError("Thiếu roleName", 400);

    const data = await deleteRoleService(roleName);

    res.status(200).json({
        success: true,
        message: "Xóa role thành công",
        data: {
            ...data,
        }
    });
});

export const getAllRolesController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAllRolesService();

    res.status(200).json({
        success: true,
        message: "Danh sách roles",
        data: {
            ...data,
        },
    });
});

