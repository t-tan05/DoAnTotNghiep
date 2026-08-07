import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cart.service";
import type { PublicProductCardItem } from "@/types/product.type";
import { addCompareItem } from "@/utils/compareStorage";
import { isStaffUser } from "@/utils/authRole";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Heart, Shuffle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    product: PublicProductCardItem;
    disableImageZoom?: boolean;
};

function formatMoney(value: number | string | null | undefined) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function HomeProductCard({ product, disableImageZoom = false }: Props) {
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
    const isOutOfStock = Number(variant.quantity_in_stock) <= 0;
    const [adding, setAdding] = useState(false);
    const saving = Math.max(originalPrice - price, 0);
    const detailUrl = `/products/${product.product_id}?variantId=${variant.variant_id}`;

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
        <article className="group/card relative flex min-h-[300px] flex-col bg-white p-3 transition hover:shadow-lg sm:min-h-[340px] md:min-h-[390px] md:p-4">
            <button
                type="button"
                onClick={handleAddToCompare}
                className="group/compare absolute right-4 top-4 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white/95 text-muted-foreground shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                aria-label="So sánh"
            >
                <Shuffle className="size-5" />
                <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover/compare:opacity-100">
                    So sánh
                </span>
            </button>

            <Link to={detailUrl} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-white md:aspect-square">
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
                            className={[
                                "h-full w-full object-contain transition duration-300",
                                disableImageZoom ? "" : "group-hover/card:scale-110",
                            ].join(" ")}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Không có ảnh
                        </div>
                    )}
                </div>
            </Link>

            <div className="mt-2 flex items-start gap-2 md:mt-3 md:gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                        {product.brand.brand_name}
                    </p>

                    <Link to={detailUrl}>
                        <h3 className="mt-1 line-clamp-2 h-9 overflow-hidden text-xs font-medium leading-[18px] text-slate-800 hover:text-blue-700 sm:h-10 sm:text-sm sm:leading-5 md:mt-2">
                            {displayName}
                        </h3>
                    </Link>
                </div>

                {!isStaff && (
                    <button
                        type="button"
                        className="mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-50 md:size-8"
                        aria-label="Thêm vào yêu thích"
                    >
                        <Heart className="size-4 md:size-5" />
                    </button>
                )}
            </div>

            <div className="mt-2 md:mt-4">
                <p className="text-base font-bold text-blue-700 md:text-lg">{formatMoney(price)}</p>
                {hasDiscount && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground line-through">
                            {formatMoney(originalPrice)}
                        </span>
                        <span className="text-red-600">-{discountPercent}%</span>
                    </div>
                )}
            </div>

            {product.color_options && product.color_options.length > 1 && (
                <div className="mt-2 flex min-h-10 items-center gap-1.5 rounded-md bg-muted/70 px-2 md:mt-3 md:min-h-12 md:gap-2">
                    {product.color_options.slice(0, 4).map((option) => (
                        <span
                            key={option.variant_id}
                            title={option.color || "Phiên bản khác"}
                            className="flex size-8 overflow-hidden rounded-md border bg-white md:size-9"
                        >
                            {option.image_url && (
                                <img src={option.image_url} alt={option.color || displayName} className="h-full w-full object-contain" />
                            )}
                        </span>
                    ))}
                </div>
            )}

            {!isStaff && (
            <div className="mt-auto pt-3 md:pt-4">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isOutOfStock || adding}
                    onClick={handleAddToCart}
                    className="h-9 w-full cursor-pointer border-blue-700 text-xs text-blue-700 transition hover:bg-blue-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:h-10 md:text-sm"
                >
                    {isOutOfStock ? "Hết hàng" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>
            </div>
            )}
        </article>
    );
}
