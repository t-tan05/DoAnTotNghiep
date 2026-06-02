import { createProductAttributeService, deleteProductAttributeService, getAllProductAttributesService, getProductAttributeService, updateProductAttributeService } from "#services/productAttribute.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createProductAttributeController = CatchAsync(async(req: Request, res: Response) => {

    const data = await createProductAttributeService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo thuộc tính sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

export const getAllProductAttributesController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAllProductAttributesService();

    res.status(200).json({
        success: true,
        message: "Lấy danh sách thuộc tính sản phẩm thành công",
        data: {
            ...data,
        }
    });
});

export const getProductAttributeController = CatchAsync(async(req: Request, res: Response) => {
    const attributeId = req.params.attributeId as string;

    const data = await getProductAttributeService(attributeId);

    res.status(200).json({
        success: true,
        message: "Lấy thuộc tính thành công",
        data: {
            ...data,
        },
    });
});

export const updateProductAttributeController = CatchAsync(async(req: Request, res: Response) => {
    const attributeId = req.params?.attributeId as string;
    const {attributeName, displayOrder} = req.body;

    const data = await updateProductAttributeService(attributeId, attributeName, displayOrder);

    res.status(200).json({
        success: true,
        message: "Cập nhật thuộc tính sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

export const deleteProductAttributeController = CatchAsync(async(req: Request, res: Response) => {
    const attributeId = req.params?.attributeId as string;

    const data = await deleteProductAttributeService(attributeId);

    res.status(200).json({
        success: true,
        message: "Đã xóa thuộc tính sản phẩm thành công",
        data: {
            ...data,
        },
    });
});