import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { reviewService } from "@/services/review.service";
import type { MyOrder, OrderDetail } from "@/types/order.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
    order: MyOrder;
    onReviewed?: () => void;
};

function getReviewProductName(detail: OrderDetail) {
    return detail.product_variants.variant_name
        || detail.product_variants.products.product_name;
}

function getReviewableProducts(order: MyOrder) {
    const productMap = new Map<string, OrderDetail>();

    for(const detail of order.orders_details) {
        const productId = detail.product_variants.products.product_id;

        if(!productMap.has(productId)) {
            productMap.set(productId, detail);
        }
    }

    return Array.from(productMap.values());
}

export default function OrderReviewButton({ order, onReviewed }: Props) {
    const [open, setOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reviewableProducts = useMemo(() => getReviewableProducts(order), [order]);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);

        if(nextOpen) {
            setSelectedProductId(reviewableProducts[0]?.product_variants.products.product_id || "");
            setRating(5);
            setComment("");
        }
    }

    async function handleSubmitReview() {
        if(!selectedProductId) {
            toast.error("Vui lòng chọn sản phẩm cần đánh giá.");
            return;
        }

        if(!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        try {
            setSubmitting(true);

            await reviewService.create({
                orderId: order.order_id,
                productId: selectedProductId,
                rating,
                comment: comment.trim(),
            });

            toast.success("Đánh giá sản phẩm thành công.");
            setOpen(false);
            onReviewed?.();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setSubmitting(false);
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(true)}
                className="cursor-pointer"
            >
                Đánh giá
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[88vh] overflow-y-auto sm:!max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                        <DialogDescription>
                            Chọn sản phẩm trong đơn hàng #{order.order_id.slice(0, 8)} để gửi đánh giá.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sản phẩm</label>

                            <select
                                value={selectedProductId}
                                onChange={(event) => setSelectedProductId(event.target.value)}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {reviewableProducts.map((detail) => {
                                    const product = detail.product_variants.products;

                                    return (
                                        <option key={product.product_id} value={product.product_id}>
                                            {getReviewProductName(detail)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Số sao</label>

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="cursor-pointer rounded-md p-1 transition hover:bg-muted"
                                        aria-label={`${star} sao`}
                                    >
                                        <Star
                                            className={
                                                star <= rating
                                                    ? "size-7 fill-yellow-400 text-yellow-400"
                                                    : "size-7 text-muted-foreground"
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung đánh giá</label>

                            <Textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => setOpen(false)}
                            className="cursor-pointer"
                        >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            disabled={submitting}
                            onClick={handleSubmitReview}
                            className="cursor-pointer"
                        >
                            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
