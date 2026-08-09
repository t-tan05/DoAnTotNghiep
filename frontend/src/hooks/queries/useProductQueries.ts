import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

export function useProductDetailQuery(productId?: string) {
    return useQuery({
        queryKey: queryKeys.products.detail(productId ?? ""),
        queryFn: () => productService.getById(productId!),
        enabled: Boolean(productId),
    });
}

export function useRelatedProductsQuery(productId?: string) {
    return useQuery({
        queryKey: queryKeys.products.related(productId ?? ""),
        queryFn: () => productService.getRelated(productId!),
        enabled: Boolean(productId),
    });
}
