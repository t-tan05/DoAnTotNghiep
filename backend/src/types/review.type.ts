export type CreateReviewPayload = {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
};