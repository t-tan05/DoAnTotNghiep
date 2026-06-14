import {
    attachProductsToPromotionService,
    createPromotionService,
    deletePromotionService,
    detachProductFromPromotionService,
    getAllPromotionsService,
    getPromotionByIdService,
    updatePromotionService,
} from "#services/promotion.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const getAllPromotionsController = CatchAsync(async (req: Request, res: Response) => {
    const data = await getAllPromotionsService();

    res.status(200).json({
        success: true,
        message: "Lấy danh sách khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const getPromotionByIdController = CatchAsync(async (req: Request, res: Response) => {
    const data = await getPromotionByIdService(req.params.promotionId as string);

    res.status(200).json({
        success: true,
        message: "Lấy thông tin khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const createPromotionController = CatchAsync(async (req: Request, res: Response) => {
    const data = await createPromotionService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const updatePromotionController = CatchAsync(async (req: Request, res: Response) => {
    const data = await updatePromotionService(req.params.promotionId as string, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const deletePromotionController = CatchAsync(async (req: Request, res: Response) => {
    const data = await deletePromotionService(req.params.promotionId as string);

    res.status(200).json({
        success: true,
        message: "Xóa khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const attachProductsToPromotionController = CatchAsync(async (req: Request, res: Response) => {
    const data = await attachProductsToPromotionService(req.params.promotionId as string, req.body);

    res.status(200).json({
        success: true,
        message: "Gắn sản phẩm vào khuyến mãi thành công",
        data: {
            ...data
        },
    });
});

export const detachProductFromPromotionController = CatchAsync(async (req: Request, res: Response) => {
    const data = await detachProductFromPromotionService(
        req.params.promotionId as string,
        req.params.productId as string,
    );

    res.status(200).json({
        success: true,
        message: "Gỡ sản phẩm khỏi khuyến mãi thành công",
        data: {
            ...data
        },
    });
});