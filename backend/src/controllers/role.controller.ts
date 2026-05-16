import { createRoleService } from "#services/role.service";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createRoleController = CatchAsync(async(req: Request, res: Response) => {
    const {roleName, description} = req.body;

    const data = await createRoleService(roleName, description);

    res.status(201).json({
        success: true,
        message: "Tạo role thành công",
        ...data,
    })
});

