import { createProductVariantService, getProductVariantService, updateProductVariantService } from "#services/productVariant.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

export const createProductVariantController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const productId = req.params?.productId as string;
    const userId = req.user.user_id;

    const files = (req.files as Express.Multer.File[]) ?? [];

    const data = await createProductVariantService(
        productId,
        req.body,
        files,
        userId,
    );

    res.status(201).json({
        success: true,
        message: "Tạo biến thể sản phẩm thành công",
    });
});

export const updateProductVariantController = CatchAsync(async(req: Request, res: Response) => {
    const variantId = req.params.variantId as string;

    const data = await updateProductVariantService(variantId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật biến thể sản phẩm thành công",
        data: {
            ...data
        },
    });
});

export const getProductVariantController = CatchAsync(async(req: Request, res: Response) => {
    const variantId = req.params.variantId as string;

    const data = await getProductVariantService(variantId);

    res.status(200).json({
        success: true,
        message: "Lấy biến thể sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

