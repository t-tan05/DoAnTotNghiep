import { createBrandService, getAllBrandsService, getBrandByIdService, updateBrandService } from "#services/brand.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createBrandController = CatchAsync(async(req: Request, res: Response) => {
    const {brandName, description} = req.body;

    const data = await createBrandService(brandName, description);

    res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công",
        ...data,
    });
});

export const getAllBrandsController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAllBrandsService();

    res.status(200).json({
        success: true,
        message: "Danh sách thương hiệu",
        data: {
            ...data,
        },
    });
});

export const getBrandByIdController = CatchAsync(async(req: Request, res: Response) => {
    const brandId = req.params.brandId as string;

    const data = await getBrandByIdService(brandId);

    res.status(200).json({
        success: true,
        message: "Tìm thương hiệu thành công",
        ...data,
    });
});

export const updateBrandController = CatchAsync(async(req: Request, res: Response) => {
    const brandId = req.params.brandId as string;
    const {brandName, description} = req.body;

    const data = await updateBrandService(brandId, brandName, description);

    res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        ...data,
    });
});

