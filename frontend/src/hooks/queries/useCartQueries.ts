import { cartService } from "@/services/cart.service";
import type { AddCartItemPayload, CartData, UpdateCartItemPayload } from "@/types/cart.type";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function emitCartChanged() {
    window.dispatchEvent(new Event("cart:changed"));
}

export function useMyCartQuery(enabled = true) {
    return useQuery<CartData | undefined>({
        queryKey: queryKeys.cart.me(),
        queryFn: cartService.getMyCart,
        enabled,
    });
}

export function useAddCartItemMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddCartItemPayload) => cartService.addItem(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
            emitCartChanged();
        },
    });
}

export function useUpdateCartItemMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: UpdateCartItemPayload }) =>
            cartService.updateItem(cartItemId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
            emitCartChanged();
        },
    });
}

export function useRemoveCartItemMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cartItemId: string) => cartService.removeItem(cartItemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
            emitCartChanged();
        },
    });
}

export function useClearCartMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartService.clearCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
            emitCartChanged();
        },
    });
}
