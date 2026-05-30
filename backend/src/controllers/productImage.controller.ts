import { addVariantImagesService, deleteProductImageService, setDefaultProductImageService } from "#services/productImage.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const addVariantImageController = CatchAsync(async(req: Request, res: Response) => {
    const variantId = req.params.variantId as string;

    const files = req.files as Express.Multer.File[];

    const data = await addVariantImagesService(variantId, files);

    res.status(201).json({
        success: true,
        message: "Thêm ảnh cho biến thể thành công",
        data: {
            ...data,
        },
    });
});

export const deleteProductImageController = CatchAsync(async(req: Request, res: Response) => {
    const imageId = req.params.imageId as string;

    const parseData = Number.parseInt(imageId);

    const data = await deleteProductImageService(parseData);

    res.status(200).json({
        success: true,
        message: "Xóa ảnh sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

export const setDefaultProductImageController = CatchAsync(async(req: Request, res: Response) => {
    const imageId = req.params.imageId as string;

    const parseData = Number.parseInt(imageId);

    const data = await setDefaultProductImageService(parseData);

    res.status(200).json({
        success: true,
        message: "Đặt ảnh mặc định thành công",
        data: {
            ...data,
        },
    });
});

