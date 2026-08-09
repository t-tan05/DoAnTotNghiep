import { queryKeys } from "@/lib/queryKeys";
import { wishlistService } from "@/services/wishlist.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useWishlistCheckQuery(
    variantId?: string,
    options?: {
        enabled?: boolean;
        initialIsWishlisted?: boolean;
    },
) {
    return useQuery({
        queryKey: queryKeys.wishlist.check(variantId ?? ""),
        queryFn: () => wishlistService.check(variantId!),
        enabled: Boolean(variantId) && (options?.enabled ?? true),
        initialData: options?.initialIsWishlisted === undefined
            ? undefined
            : { isWishlisted: options.initialIsWishlisted },
    });
}

export function useToggleWishlistMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ variantId, isWishlisted }: { variantId: string; isWishlisted: boolean }) =>
            isWishlisted ? wishlistService.remove(variantId) : wishlistService.add(variantId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(queryKeys.wishlist.check(variables.variantId), {
                isWishlisted: Boolean(data?.isWishlisted),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
        },
    });
}
