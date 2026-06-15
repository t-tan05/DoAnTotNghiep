import { findProductById } from "#models/product.model";
import { attachProductsToPromotion, createPromotion, deletePromotion, detachProductFromPromotion, findAllPromotions, findDuplicatePromotion, findProductInPromotionByProductId, findPromotionById, refreshAllPromotionsActive, refreshPromotionActive, updatePromotion, } from "#models/promotion.model";
import AppError from "#utils/AppError";
import crypto from "crypto";
const PROMOTION_NOT_FOUND_MESSAGE = "Không tìm thấy khuyến mãi.";
const INVALID_PROMOTION_DATE_MESSAGE = "Ngày kết thúc phải sau ngày bắt đầu.";
const PROMOTION_DUPLICATE_MESSAGE = "Khuyến mãi đã tồn tại.";
const calculateActive = (startDate, endDate) => {
    const now = new Date();
    return now >= startDate && now <= endDate;
};
const validateDates = (startDate, endDate) => {
    if (endDate <= startDate) {
        throw new AppError(INVALID_PROMOTION_DATE_MESSAGE, 400);
    }
};
const validateDuplicate = async (promotionName, startDate, endDate, excludedPromotionId) => {
    const duplicatePromotion = await findDuplicatePromotion(promotionName, startDate, endDate, excludedPromotionId);
    if (duplicatePromotion)
        throw new AppError(PROMOTION_DUPLICATE_MESSAGE, 409);
};
export const getAllPromotionsService = async () => {
    await refreshAllPromotionsActive(new Date());
    const promotions = await findAllPromotions();
    return { promotions };
};
export const getPromotionByIdService = async (promotionId) => {
    const promotion = await findPromotionById(promotionId);
    if (!promotion)
        throw new AppError(PROMOTION_NOT_FOUND_MESSAGE, 404);
    const correctActive = calculateActive(promotion.start_date, promotion.end_date);
    if (promotion.is_active !== correctActive) {
        const refreshedPromotion = await refreshPromotionActive(promotionId, correctActive);
        return { promotion: refreshedPromotion };
    }
    return { promotion };
};
export const createPromotionService = async (payload) => {
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    validateDates(startDate, endDate);
    await validateDuplicate(payload.promotionName, startDate, endDate);
    if (payload.productIds !== undefined) {
        for (const id of payload.productIds) {
            const existedProduct = await findProductById(id);
            if (!existedProduct) {
                throw new AppError(`Không tìm thấy sản phẩm có mã ${id} để gắn vào khuyến mãi.`, 404);
            }
        }
    }
    const promotion = await createPromotion({
        promotion_id: crypto.randomUUID(),
        promotion_name: payload.promotionName,
        description: payload.description || null,
        discount_type: payload.discountType,
        discount_value: payload.discountValue,
        start_date: startDate,
        end_date: endDate,
        is_active: calculateActive(startDate, endDate),
    }, payload.productIds ?? []);
    return { promotion };
};
export const updatePromotionService = async (promotionId, payload) => {
    const promotion = await findPromotionById(promotionId);
    if (!promotion)
        throw new AppError(PROMOTION_NOT_FOUND_MESSAGE, 404);
    const promotionName = payload.promotionName ?? promotion.promotion_name;
    const startDate = payload.startDate !== undefined
        ? new Date(payload.startDate)
        : promotion.start_date;
    const endDate = payload.endDate !== undefined
        ? new Date(payload.endDate)
        : promotion.end_date;
    validateDates(startDate, endDate);
    await validateDuplicate(promotionName, startDate, endDate, promotionId);
    const updatedPromotion = await updatePromotion(promotionId, {
        promotion_name: promotionName,
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.discountType !== undefined ? { discount_type: payload.discountType } : {}),
        ...(payload.discountValue !== undefined ? { discount_value: payload.discountValue } : {}),
        start_date: startDate,
        end_date: endDate,
        is_active: calculateActive(startDate, endDate),
    });
    return { updatedPromotion };
};
export const deletePromotionService = async (promotionId) => {
    const promotion = await findPromotionById(promotionId);
    if (!promotion)
        throw new AppError(PROMOTION_NOT_FOUND_MESSAGE, 404);
    const deletedPromotion = await deletePromotion(promotionId);
    return { deletedPromotion };
};
export const attachProductsToPromotionService = async (promotionId, payload) => {
    const promotion = await findPromotionById(promotionId);
    if (!promotion)
        throw new AppError(PROMOTION_NOT_FOUND_MESSAGE, 404);
    const result = await attachProductsToPromotion(promotionId, payload.productIds);
    return { result };
};
export const detachProductFromPromotionService = async (promotionId, productId) => {
    const promotion = await findPromotionById(promotionId);
    if (!promotion)
        throw new AppError(PROMOTION_NOT_FOUND_MESSAGE, 404);
    const existedProduct = await findProductInPromotionByProductId(promotionId, productId);
    if (!existedProduct)
        throw new AppError(`Không tìm thấy sản phẩm được gán cho khuyến mãi này.`, 404);
    const result = await detachProductFromPromotion(promotionId, productId);
    return { result };
};
