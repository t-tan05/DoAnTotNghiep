import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { cartService } from "@/services/cart.service";
import type { Cart, CartItem } from "@/types/cart.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

function getVariantImage(item: CartItem) {
    return (
        item.product_variants.image_url ||
        item.product_variants.product_images?.find((image) => image.is_default)?.image_url ||
        item.product_variants.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantAttributes(item: CartItem) {
    return item.product_variants.variant_attribute_values
        ?.map((row) => row.attribute_values.value)
        .filter(Boolean)
        .join(" / ");
}

function getProductDetailUrl(item: CartItem) {
    return `/products/${item.product_variants.product_id}?variantId=${item.product_variants.variant_id}`;
}

export default function CartDropdown() {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const items = cart?.carts_items ?? [];
    const previewItems = items.slice(0, 5);
    const totalQuantity = cart?.totalQuantity ?? 0;

    const totalPrice = useMemo(() => {
        if (cart?.totalPrice !== undefined) return Number(cart.totalPrice);

        return items.reduce((sum, item) => {
            return sum + Number(item.price_at_add) * item.quantity;
        }, 0);
    }, [cart?.totalPrice, items]);

    const loadCart = useCallback(async(options?: { silent?: boolean }) => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            if (!options?.silent) setLoading(true);
            setError("");

            const data = await cartService.getMyCart();
            setCart(data?.cart ?? null);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        function handleCartChanged() {
            loadCart({ silent: true });
        }

        window.addEventListener("cart:changed", handleCartChanged);

        return () => {
            window.removeEventListener("cart:changed", handleCartChanged);
        };
    }, [loadCart]);

    return (
        <div
            className="group relative"
            onMouseEnter={() => loadCart({ silent: true })}
            onFocus={() => loadCart({ silent: true })}
        >
            <Link
                to={isAuthenticated ? "/cart" : "/login"}
                aria-label="Giỏ hàng"
                className="relative flex size-10 items-center justify-center rounded-full bg-blue-700 text-white transition hover:bg-blue-800 md:size-12"
            >
                <ShoppingCart className="size-5 md:size-6" />

                {totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold leading-5 text-white ring-2 ring-white">
                        {totalQuantity > 99 ? "99+" : totalQuantity}
                    </span>
                )}
            </Link>

            <div
                className={cn(
                    "invisible absolute right-0 top-full z-50 mt-3 w-[min(92vw,440px)] translate-y-2 rounded-lg border bg-white p-4 opacity-0 shadow-xl transition-all duration-200",
                    "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                )}
            >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold text-blue-700">Giỏ hàng của bạn</p>
                        <p className="text-sm text-muted-foreground">
                            {totalQuantity} sản phẩm
                        </p>
                    </div>

                    <ShoppingCart className="size-6 text-blue-700" />
                </div>

                {!isAuthenticated ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Đăng nhập để xem giỏ hàng của bạn.
                        </p>
                        <Button asChild className="mt-3 w-full cursor-pointer">
                            <Link to="/login">Đăng nhập</Link>
                        </Button>
                    </div>
                ) : loading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Đang tải giỏ hàng...
                    </p>
                ) : error ? (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                ) : items.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Chưa có sản phẩm nào trong giỏ hàng.
                        </p>
                        <Button asChild className="mt-3 w-full cursor-pointer">
                            <Link to="/products">Mua sắm ngay</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                            {previewItems.map((item) => {
                                const image = getVariantImage(item);
                                const attributes = getVariantAttributes(item);
                                const displayName = item.product_variants.variant_name || item.product_variants.products.product_name;

                                return (
                                    <Link
                                        key={item.cart_item_id}
                                        to={getProductDetailUrl(item)}
                                        className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-lg p-2 transition hover:bg-muted"
                                    >
                                        <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={displayName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-medium text-foreground">
                                                {displayName}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {item.product_variants.sku || "Chưa có SKU"}
                                            </p>
                                            {attributes && (
                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    {attributes}
                                                </p>
                                            )}
                                            <div className="mt-1 flex items-center justify-between gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Số lượng {item.quantity}
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    {formatPrice(item.price_at_add)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {items.length > previewItems.length && (
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                Còn {items.length - previewItems.length} sản phẩm khác trong giỏ hàng.
                            </p>
                        )}

                        <div className="mt-4 border-t pt-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Tổng tiền ({totalQuantity}) sản phẩm
                                </span>
                                <span className="text-xl font-bold">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>

                            <Button asChild className="h-11 w-full cursor-pointer bg-blue-700 hover:bg-blue-800">
                                <Link to="/cart">Xem giỏ hàng</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
