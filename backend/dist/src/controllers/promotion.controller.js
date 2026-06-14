import { attachProductsToPromotionService, createPromotionService, deletePromotionService, detachProductFromPromotionService, getAllPromotionsService, getPromotionByIdService, updatePromotionService, } from "#services/promotion.service";
import { CatchAsync } from "#utils/CatchAsync";
export const getAllPromotionsController = CatchAsync(async (req, res) => {
    const data = await getAllPromotionsService();
    res.status(200).json({
        success: true,
        message: "Lấy danh sách khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const getPromotionByIdController = CatchAsync(async (req, res) => {
    const data = await getPromotionByIdService(req.params.promotionId);
    res.status(200).json({
        success: true,
        message: "Lấy thông tin khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const createPromotionController = CatchAsync(async (req, res) => {
    const data = await createPromotionService(req.body);
    res.status(201).json({
        success: true,
        message: "Tạo khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const updatePromotionController = CatchAsync(async (req, res) => {
    const data = await updatePromotionService(req.params.promotionId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const deletePromotionController = CatchAsync(async (req, res) => {
    const data = await deletePromotionService(req.params.promotionId);
    res.status(200).json({
        success: true,
        message: "Xóa khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const attachProductsToPromotionController = CatchAsync(async (req, res) => {
    const data = await attachProductsToPromotionService(req.params.promotionId, req.body);
    res.status(200).json({
        success: true,
        message: "Gắn sản phẩm vào khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
export const detachProductFromPromotionController = CatchAsync(async (req, res) => {
    const data = await detachProductFromPromotionService(req.params.promotionId, req.params.productId);
    res.status(200).json({
        success: true,
        message: "Gỡ sản phẩm khỏi khuyến mãi thành công",
        data: {
            ...data
        },
    });
});
