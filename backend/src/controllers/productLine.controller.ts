import {
    createProductLineService,
    deleteProductLineService,
    getAllProductLinesService,
    getProductLineByIdService,
    updateProductLineService,
} from "#services/productLine.service";
import { ProductLineSortBy } from "#types/productLine.type";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
import { Request, Response } from "express";

const allowedSortFields: ProductLineSortBy[] = ["line_name", "display_order", "created_at"];

export const createProductLineController = CatchAsync(async(req: Request, res: Response) => {
    const data = await createProductLineService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});

export const getAllProductLinesController = CatchAsync(async(req: Request, res: Response) => {
    const query = parseListQuery({
        query: req.query,
        allowedSortFields,
        defaultSortBy: "line_name",
    });

    const data = await getAllProductLinesService({
        ...query,
        brandId: req.query.brandId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        isActive: req.query.isActive !== undefined
            ? String(req.query.isActive) === "true"
            : undefined,
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});

export const getProductLineByIdController = CatchAsync(async(req: Request, res: Response) => {
    const lineId = req.params.lineId as string;
    const data = await getProductLineByIdService(lineId);

    res.status(200).json({
        success: true,
        message: "Lấy dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});

export const updateProductLineController = CatchAsync(async(req: Request, res: Response) => {
    const lineId = req.params.lineId as string;
    const data = await updateProductLineService(lineId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});

export const deleteProductLineController = CatchAsync(async(req: Request, res: Response) => {
    const lineId = req.params.lineId as string;
    const data = await deleteProductLineService(lineId);

    res.status(200).json({
        success: true,
        message: "Xóa dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
