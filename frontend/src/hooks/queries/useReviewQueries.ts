import { queryKeys } from "@/lib/queryKeys";
import { reviewService } from "@/services/review.service";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useProductReviewsQuery(productId: string, rating: number | "all") {
    return useInfiniteQuery({
        queryKey: queryKeys.reviews.product(productId, rating),
        queryFn: ({ pageParam }) =>
            reviewService.getByProduct(
                productId,
                pageParam,
                5,
                rating === "all" ? undefined : rating,
            ),
        enabled: Boolean(productId),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.meta.page + 1;
            return nextPage <= lastPage.meta.totalPages ? nextPage : undefined;
        },
    });
}
