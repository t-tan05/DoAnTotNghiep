import { createProductService } from "#services/product.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

export const createProductController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    
    const files = (req.files as Express.Multer.File[]) ?? [];

    const result = await createProductService(
        req.body,
        files,
        userId,
    );

    return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: {
            ...result,
        },
    });
});