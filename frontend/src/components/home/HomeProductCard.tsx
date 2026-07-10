import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cart.service";
import type { PublicProductCardItem } from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Heart } from "lucide-react";
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
    const { isAuthenticated } = useAuth();

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

    return (
        <article className="group/card relative flex min-h-[430px] flex-col bg-white p-4 transition hover:shadow-lg">
            <Link to={detailUrl} className="block">
                <div className="relative aspect-square overflow-hidden bg-white">
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
                            No image
                        </div>
                    )}
                </div>
            </Link>

            <div className="mt-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                        {product.brand.brand_name}
                    </p>

                    <Link to={detailUrl}>
                        <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-medium text-slate-800 hover:text-blue-700">
                            {displayName}
                        </h3>
                    </Link>
                </div>

                <button
                    type="button"
                    className="mt-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-50"
                    aria-label="Thêm vào yêu thích"
                >
                    <Heart className="size-5" />
                </button>
            </div>

            <div className="mt-4">
                <p className="text-lg font-bold text-blue-700">{formatMoney(price)}</p>
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
                <div className="mt-3 flex min-h-12 items-center gap-2 rounded-md bg-muted/70 px-2">
                    {product.color_options.slice(0, 4).map((option) => (
                        <span
                            key={option.variant_id}
                            title={option.color || "Phiên bản khác"}
                            className="flex size-9 overflow-hidden rounded-md border bg-white"
                        >
                            {option.image_url && (
                                <img src={option.image_url} alt={option.color || displayName} className="h-full w-full object-contain" />
                            )}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-4">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isOutOfStock || adding}
                    onClick={handleAddToCart}
                    className="h-10 w-full cursor-pointer border-blue-700 text-blue-700 transition hover:bg-blue-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isOutOfStock ? "Hết hàng" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>
            </div>
        </article>
    );
}
