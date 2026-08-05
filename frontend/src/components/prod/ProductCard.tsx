import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import type { PublicProductCardItem } from "@/types/product.type";
import { isStaffUser } from "@/utils/authRole";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Heart, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { addCompareItem } from "@/utils/compareStorage";

type Props = {
    product: PublicProductCardItem;
    isWishlisted?: boolean;
    onWishlistChange?: (variantId: string, isWishlisted: boolean) => void;
};

function formatMoney(value: number | string | null | undefined) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function ProductCard({
    product,
    isWishlisted: initialIsWishlisted = false,
    onWishlistChange,
}: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const isStaff = isStaffUser(user);

    const variant = product.variant;

    const displayName = variant.variant_name || product.product_name;
    const price = Number(variant.discount_price ?? variant.price);
    const originalPrice = Number(variant.original_price ?? variant.price);
    const hasDiscount = originalPrice > price;
    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;
    const saving = Math.max(originalPrice - price, 0);
    const isOutOfStock = Number(variant.quantity_in_stock) <= 0;
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        setIsWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted, variant.variant_id]);

    async function handleToggleWishlist() {
        if(isStaff) return;

        if(!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            });
            return;
        }

        try {
            setWishlistLoading(true);

            const data = isWishlisted
                ? await wishlistService.remove(variant.variant_id)
                : await wishlistService.add(variant.variant_id);

            const nextIsWishlisted = Boolean(data?.isWishlisted);
            setIsWishlisted(nextIsWishlisted);
            onWishlistChange?.(variant.variant_id, nextIsWishlisted);
            toast.success(
                data?.isWishlisted
                    ? "Đã thêm vào sản phẩm yêu thích."
                    : "Đã bỏ khỏi sản phẩm yêu thích.",
            );
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setWishlistLoading(false);
        }
    }

    async function handleAddToCart() {
        if(isStaff) return;
        if(isOutOfStock) return;

        if(!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            });
            return;
        }

        try {
            setAdding(true);

            await cartService.addItem({
                variantId: variant.variant_id,
                quantity: 1,
            });

            toast.success("Đã thêm sản phẩm vào giỏ hàng.");
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setAdding(false);
        }
    }
    
    function handleAddToCompare() {
        const result = addCompareItem({
            productId: product.product_id,
            variantId: variant.variant_id,
        });

        if(!result.success && result.reason === "limit") {
            toast.error("Chỉ có thể so sánh tối đa 3 sản phẩm.");
            return;
        }

        if(result.reason === "exists") {
            toast.info("Sản phẩm đã có trong danh sách so sánh.");
            return;
        }

        toast.success("Đã thêm vào danh sách so sánh.");
    }

    return (
        <div className="group relative flex h-full flex-col rounded-md border bg-white p-3 transition hover:border-blue-700 hover:shadow-sm">
            <button
                type="button"
                onClick={handleAddToCompare}
                className="group/compare absolute right-5 top-5 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white/95 text-muted-foreground shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                aria-label="So sánh"
            >
                <Shuffle className="size-5" />
                <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover/compare:opacity-100">
                    so sánh
                </span>
            </button>
            {!isStaff && (
            <button
                type="button"
                disabled={wishlistLoading}
                onClick={handleToggleWishlist}
                className="absolute right-5 top-16 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white/95 text-muted-foreground shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
                <Heart
                    className={[
                        "size-5",
                        isWishlisted ? "fill-blue-700 border-blue-200" : "",
                    ].join(" ")}
                />
            </button>
            )}

            <Link
                to={`/products/${product.product_id}?variantId=${variant.variant_id}`}
                className="block"
            >
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    {saving > 0 && (
                        <div className="absolute bottom-3 left-3 z-10 rounded bg-blue-700 px-2 py-1 text-xs font-bold leading-tight text-white shadow">
                            <span className="block">TIẾT KIỆM</span>
                            <span>{formatMoney(saving)}</span>
                        </div>
                    )}

                    {variant.image_url ? (
                        <img
                            src={variant.image_url}
                            alt={displayName}
                            className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>

                <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {product.brand.brand_name}
                    </p>

                    <h3 className="line-clamp-2 min-h-10 text-sm font-medium">
                        {displayName}
                    </h3>

                    {product.color_options && product.color_options.length > 1 && (
                        <div className="flex items-center gap-1.5">
                            {product.color_options.slice(0, 5).map((option) => (
                                <span
                                    key={option.variant_id}
                                    title={option.color || "Phiên bản khác"}
                                    className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border bg-muted"
                                >
                                    {option.image_url ? (
                                        <img
                                            src={option.image_url}
                                            alt={option.color || displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </span>
                            ))}

                            {product.color_options.length > 5 && (
                                <span className="text-xs text-muted-foreground">
                                    +{product.color_options.length - 5}
                                </span>
                            )}
                        </div>
                    )}

                    {product.variant_count && product.variant_count > 1 && (
                        <p className="text-xs text-muted-foreground">
                            Có {product.variant_count} màu sắc/phiên bản
                        </p>
                    )}

                    <div>
                        <div className="text-lg font-bold text-blue-700">
                            {formatMoney(price)}
                        </div>

                        {hasDiscount && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground line-through">
                                    {formatMoney(originalPrice)}
                                </span>
                                <span className="text-red-600">-{discountPercent}%</span>
                            </div>
                        )}
                    </div>

                    <div className={isOutOfStock ? "text-xs text-red-600" : "text-xs text-green-600"}>
                        {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                    </div>
                </div>
            </Link>

            {!isStaff && (
            <div className="mt-auto pt-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isOutOfStock || adding}
                    onClick={handleAddToCart}
                    className="w-full cursor-pointer border-blue-700 text-blue-700 hover:bg-blue-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                >
                    {isOutOfStock ? "Hết hàng" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>
            </div>
            )}
        </div>
    );
}
