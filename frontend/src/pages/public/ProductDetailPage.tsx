import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

function getVariantImage(variant?: AdminProductVariant | null) {
    return (
        variant?.image_url ||
        variant?.product_images?.find((image) => image.is_default)?.image_url ||
        variant?.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantAttributes(variant?: AdminProductVariant | null) {
    return variant?.variant_attribute_values
        ?.map((row) => `${row.attribute_values.product_attributes.attribute_name}: ${row.attribute_values.value}`)
        .join(" / ");
}

function getVariantPrice(variant?: AdminProductVariant | null) {
    return Number(variant?.discount_price ?? variant?.price ?? 0);
}

function getVariantOriginalPrice(variant?: AdminProductVariant | null) {
    const original = Number(variant?.original_price ?? variant?.price ?? 0);
    const current = getVariantPrice(variant);

    return original > current ? original : null;
}

export default function ProductDetailPage() {
    const { productId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProduct() {
            if (!productId) return;

            try {
                setLoading(true);
                setError("");

                const data = await productService.getById(productId);
                const loadedProduct = data?.product ?? null;
                const variants = loadedProduct?.product_variants ?? [];
                const queryVariantId = searchParams.get("variantId");
                const matchedVariant = variants.find((variant) => variant.variant_id === queryVariantId);

                setProduct(loadedProduct);
                setSelectedVariantId(matchedVariant?.variant_id ?? variants[0]?.variant_id ?? "");
            } catch (error) {
                setError(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [productId]);

    const selectedVariant = useMemo(() => {
        return product?.product_variants.find((variant) => variant.variant_id === selectedVariantId) ?? null;
    }, [product?.product_variants, selectedVariantId]);

    const availableQuantity = Math.max(
        0,
        Number(selectedVariant?.quantity_in_stock ?? 0) - Number(selectedVariant?.reserved_quantity ?? 0),
    );

    const image = getVariantImage(selectedVariant);
    const attributes = getVariantAttributes(selectedVariant);
    const originalPrice = getVariantOriginalPrice(selectedVariant);
    const displayName = selectedVariant?.variant_name || product?.product_name || "";

    useEffect(() => {
        if (!product) return;

        const queryVariantId = searchParams.get("variantId");
        if (!queryVariantId || queryVariantId === selectedVariantId) return;

        const matchedVariant = product.product_variants.find((variant) => variant.variant_id === queryVariantId);
        if (!matchedVariant) return;

        setSelectedVariantId(matchedVariant.variant_id);
        setQuantity(1);
    }, [product, searchParams, selectedVariantId]);

    function selectVariant(variant: AdminProductVariant) {
        setSelectedVariantId(variant.variant_id);
        setQuantity(1);
        setSearchParams({ variantId: variant.variant_id });
    }

    async function handleAddToCart() {
        if (!selectedVariant) return;

        if (!isAuthenticated) {
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
                variantId: selectedVariant.variant_id,
                quantity,
            });
            toast.success("Đã thêm sản phẩm vào giỏ hàng.");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setAdding(false);
        }
    }

    if (loading) return <PageLoading text="Đang tải sản phẩm..." />;

    if (error) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <div className="rounded-lg border bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            </section>
        );
    }

    if (!product) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="font-medium">Không tìm thấy sản phẩm.</p>
                    <Button asChild className="mt-4 cursor-pointer">
                        <Link to="/">Về trang chủ</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                        {image ? (
                            <img
                                src={image}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                Chưa có ảnh sản phẩm
                            </div>
                        )}
                    </div>

                    {selectedVariant?.product_images && selectedVariant.product_images.length > 1 && (
                        <div className="grid grid-cols-5 gap-3">
                            {selectedVariant.product_images.map((item) => (
                                <div
                                    key={item.image_id}
                                    className="aspect-square overflow-hidden rounded-md border bg-muted"
                                >
                                    <img
                                        src={item.image_url}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {product.brands?.brand_name} / {product.categories?.category_name}
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                            {displayName}
                        </h1>
                        {selectedVariant?.sku && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                SKU: {selectedVariant.sku}
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border bg-muted/40 p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <span className="text-3xl font-bold text-blue-700">
                                {formatPrice(getVariantPrice(selectedVariant))}
                            </span>
                            {originalPrice && (
                                <span className="text-base text-muted-foreground line-through">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>
                        {selectedVariant?.active_promotion && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {selectedVariant.active_promotion.promotion_name}
                            </p>
                        )}
                    </div>

                    {attributes && (
                        <div>
                            <h2 className="font-semibold">Cấu hình đang chọn</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {attributes}
                            </p>
                        </div>
                    )}

                    {product.product_variants.length > 1 && (
                        <div>
                            <h2 className="font-semibold">Phiên bản sản phẩm</h2>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {product.product_variants.map((variant) => {
                                    const variantAttributes = getVariantAttributes(variant);
                                    const selected = variant.variant_id === selectedVariantId;

                                    return (
                                        <button
                                            key={variant.variant_id}
                                            type="button"
                                            onClick={() => selectVariant(variant)}
                                            className={cn(
                                                "rounded-lg border p-3 text-left transition hover:border-blue-600 hover:bg-blue-50",
                                                selected && "border-blue-700 bg-blue-50 ring-1 ring-blue-700",
                                            )}
                                        >
                                            <p className="truncate text-sm font-semibold">
                                                {variant.variant_name || variant.sku || "Biến thể sản phẩm"}
                                            </p>
                                            {variantAttributes && (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {variantAttributes}
                                                </p>
                                            )}
                                            <p className="mt-2 text-sm font-bold text-blue-700">
                                                {formatPrice(getVariantPrice(variant))}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center rounded-lg border">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={quantity <= 1}
                                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                className="cursor-pointer disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={availableQuantity <= 0 || quantity >= availableQuantity}
                                onClick={() => setQuantity((value) => value + 1)}
                                className="cursor-pointer disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Còn {availableQuantity} sản phẩm có thể mua
                        </p>
                    </div>

                    <Button
                        type="button"
                        disabled={!selectedVariant || availableQuantity <= 0 || adding}
                        onClick={handleAddToCart}
                        className="h-12 w-full cursor-pointer bg-blue-700 text-base hover:bg-blue-800 disabled:!pointer-events-auto disabled:!cursor-not-allowed sm:w-auto sm:min-w-56"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </Button>

                    {(selectedVariant?.product_variant_specs?.length ?? 0) > 0 && (
                        <div className="rounded-lg border p-4">
                            <h2 className="font-semibold">Thông số kỹ thuật</h2>
                            <div className="mt-3 divide-y text-sm">
                                {selectedVariant?.product_variant_specs?.map((spec) => (
                                    <div
                                        key={`${spec.spec_key}-${spec.spec_value}`}
                                        className="grid grid-cols-[160px_minmax(0,1fr)] gap-4 py-2"
                                    >
                                        <span className="text-muted-foreground">{spec.spec_key}</span>
                                        <span className="font-medium">{spec.spec_value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.description && (
                        <div className="rounded-lg border p-4">
                            <h2 className="font-semibold">Mô tả sản phẩm</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
