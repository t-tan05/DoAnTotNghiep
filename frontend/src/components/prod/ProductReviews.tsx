import { Button } from "@/components/ui/button";
import { reviewService } from "@/services/review.service";
import type { ProductReview, ProductReviewSummary } from "@/types/review.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    productId: string;
    onSummaryChange?: (summary: ProductReviewSummary) => void;
};

export default function ProductReviews({ productId, onSummaryChange }: Props) {
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [summary, setSummary] = useState<ProductReviewSummary | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

    async function loadReviews(nextPage = 1) {
        try {
            setLoading(true);

            const data = await reviewService.getByProduct(
                productId, 
                nextPage, 
                5,
                ratingFilter === "all" ? undefined : ratingFilter,
            );

            setReviews((current) =>
                nextPage === 1 ? data.reviews : [...current, ...data.reviews]
            );
            setSummary(data.summary);
            setTotalPages(data.meta.totalPages);
            setPage(nextPage);
            onSummaryChange?.(data.summary);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(productId) loadReviews(1);
    }, [productId, ratingFilter]);

    if(!summary || summary.totalReviews === 0) {
        return null;
    }

    function handleFilterChange(value: number | "all") {
        setRatingFilter(value);
        setReviews([]);
        setPage(1);
    }

    return (
        <section className="mt-6 rounded-lg bg-white shadow-sm">
            <div className="border-b px-4 py-4">
                <h2 className="text-xl font-semibold">Đánh giá</h2>
            </div>

            <div className="grid gap-6 border-b p-4 md:grid-cols-[260px_1fr]">
                <div className="flex flex-col items-center justify-center border-r">
                    <p className="text-4xl font-bold">
                        {summary.averageRating.toFixed(1)}/5
                    </p>

                    <div className="mt-2 flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={
                                    star <= Math.round(summary.averageRating)
                                        ? "size-5 fill-yellow-400 text-yellow-400"
                                        : "size-5 fill-gray-200 text-gray-200"
                                }
                            />
                        ))}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {summary.totalReviews} lượt đánh giá
                    </p>
                </div>

                <div className="space-y-3">
                    {summary.ratingStats.map((item) => {
                        const percent = summary.totalReviews
                            ? (item.count / summary.totalReviews) * 100
                            : 0;

                        return (
                            <div key={item.rating} className="flex items-center gap-3 text-sm">
                                <span className="w-6">{item.rating}</span>
                                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                <div className="h-2 flex-1 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-blue-700"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-28 text-muted-foreground">
                                    {item.count} lượt đánh giá
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-4">
                <span className="mr-2 text-lg font-semibold">Lọc đánh giá:</span>

                <Button
                    type="button"
                    variant={ratingFilter === "all" ? "default" : "outline"}
                    onClick={() => handleFilterChange("all")}
                    className="cursor-pointer rounded-full"
                >
                    Tất cả
                </Button>

                {[5, 4, 3, 2, 1].map((star) => (
                    <Button
                        key={star}
                        type="button"
                        variant={ratingFilter === star ? "default" : "outline"}
                        onClick={() => handleFilterChange(star)}
                        className="cursor-pointer rounded-full"
                    >
                        {star}
                        <Star className="ml-1 size-4 fill-yellow-400 text-yellow-400" />
                    </Button>
                ))}
            </div>

            <div className="space-y-5 p-4">
                {reviews.map((review) => (
                    <article key={review.review_id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-500 font-semibold text-white">
                                {review.users?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">{review.users?.name || "Khách hàng"}</p>

                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={
                                                    star <= review.rating
                                                        ? "size-4 fill-yellow-400 text-yellow-400"
                                                        : "size-4 fill-gray-200 text-gray-200"
                                                }
                                            />
                                        ))}
                                    </div>

                                    <span>
                                        {new Date(review.created_at).toLocaleString("vi-VN")}
                                    </span>
                                </div>

                                <p className="mt-3 leading-7">{review.comment}</p>

                                {review.review_images && review.review_images.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {review.review_images.map((image) => (
                                            <img
                                                key={image.image_id}
                                                src={image.image_url}
                                                alt="Ảnh đánh giá"
                                                className="size-20 rounded-md border object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {page < totalPages && (
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => loadReviews(page + 1)}
                            className="cursor-pointer rounded-full"
                        >
                            {loading ? "Đang tải..." : "Xem thêm đánh giá"}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}