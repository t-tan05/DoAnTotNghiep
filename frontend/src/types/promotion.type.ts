import type { AdminProduct } from "./product.type";

export type PromotionDiscountType = "PERCENT" | "FIXED";

export type Promotion = {
    promotion_id: string;
    promotion_name: string;
    description?: string | null;
    discount_type: PromotionDiscountType;
    discount_value: string | number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    products_promotions: Array<{
        product_id: string;
        promotion_id: string;
        products: AdminProduct;
    }>;
};

export type PromotionListData = {
    promotions: Promotion[];
};

export type CreatePromotionPayload = {
    promotionName: string;
    description?: string | null;
    discountType: PromotionDiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
    productIds?: string[];
};

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;

export type AttachProductsToPromotionPayload = {
    productIds: string[];
};