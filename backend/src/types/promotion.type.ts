import { promotions_discount_type } from "@prisma/client";

export interface CreatePromotionPayload {
    promotionName: string;
    description?: string | null;
    discountType: promotions_discount_type;
    discountValue: number;
    startDate: string;
    endDate: string;
    productIds?: string[];
};

export interface UpdatePromotionPayload {
    promotionName?: string;
    description?: string | null;
    discountType?: promotions_discount_type;
    discountValue?: number;
    startDate?: string;
    endDate?: string;
};

export interface AttachProductsToPromotionPayload {
    productIds: string[];
}
