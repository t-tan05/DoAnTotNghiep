import { createCategoryService, getAllCategoriesService, getCategoryByIdService } from "#services/category.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createCategoryController = CatchAsync(async(req: Request, res: Response) => {
    const {categoryName, description} = req.body;

    const data = await createCategoryService(categoryName, description);

    res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        ...data,
    });
});

export const getAllCategoriesController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAllCategoriesService();

    res.status(200).json({
        success: true,
        message: "Danh sách danh mục",
        data: {
            ...data,
        },
    });
});

export const getCategoryByIdController = CatchAsync(async(req: Request, res: Response) => {
    const categoryId = req.params.categoryId as string;

    const data = await getCategoryByIdService(categoryId);

    res.status(200).json({
        success: true,
        message: "Tìm danh mục thành công",
        ...data,
    });
});

