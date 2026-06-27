import PageLoading from "@/components/common/PageLoading";
import BlogContent from "@/components/blog/BlogContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ChevronLeft, ChevronRight, Home, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type ProductImage = {
    image_id: number | string;
    image_url: string;
    is_default?: boolean | null;
};

type AttributeOption = {
    value: string;
    imageUrl?: string;
};

type AttributeGroup = {
    name: string;
    options: AttributeOption[];
};

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

const THUMBNAILS_PER_PAGE = 5;
const BUY_NOW_STORAGE_KEY = "checkout:buy-now";

function getVariantImages(variant?: AdminProductVariant | null): ProductImage[] {
    if (!variant) return [];

    const images = variant.product_images?.length
        ? [...variant.product_images].sort((a, b) => Number(b.is_default) - Number(a.is_default))
        : [];

    if (variant.image_url && !images.some((image) => image.image_url === variant.image_url)) {
        return [
            {
                image_id: `${variant.variant_id}-default`,
                image_url: variant.image_url,
                is_default: true,
            },
            ...images,
        ];
    }

    return images;
}

function getProductImages(product?: AdminProduct | null): ProductImage[] {
    return product?.product_images ?? [];
}

function uniqueImages(images: ProductImage[]) {
    const seen = new Set<string>();

    return images.filter((image) => {
        if (seen.has(image.image_url)) return false;
        seen.add(image.image_url);
        return true;
    });
}

function getVariantAttributeMap(variant?: AdminProductVariant | null) {
    const map: Record<string, string> = {};

    variant?.variant_attribute_values?.forEach((row) => {
        const attributeName = row.attribute_values.product_attributes.attribute_name;
        const value = row.attribute_values.value;
        map[attributeName] = value;
    });

    return map;
}

function getVariantPrice(variant?: AdminProductVariant | null) {
    return Number(variant?.discount_price ?? variant?.price ?? 0);
}

function getVariantOriginalPrice(variant?: AdminProductVariant | null) {
    const original = Number(variant?.original_price ?? variant?.price ?? 0);
    const current = getVariantPrice(variant);

    return original > current ? original : null;
}

function getDiscountPercent(originalPrice: number | null, currentPrice: number) {
    if (!originalPrice || originalPrice <= currentPrice) return null;

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

function buildAttributeGroups(variants: AdminProductVariant[]): AttributeGroup[] {
    const groups = new Map<string, Map<string, AttributeOption>>();

    variants.forEach((variant) => {
        const imageUrl = variant.image_url || variant.product_images?.find((image) => image.is_default)?.image_url || variant.product_images?.[0]?.image_url;

        variant.variant_attribute_values?.forEach((row) => {
            const attributeName = row.attribute_values.product_attributes.attribute_name;
            const value = row.attribute_values.value;

            if (!groups.has(attributeName)) {
                groups.set(attributeName, new Map());
            }

            const optionMap = groups.get(attributeName)!;

            if (!optionMap.has(value)) {
                optionMap.set(value, {
                    value,
                    imageUrl,
                });
            }
        });
    });

    return Array.from(groups.entries()).map(([name, optionMap]) => ({
        name,
        options: Array.from(optionMap.values()),
    }));
}

function variantMatchesSelection(variant: AdminProductVariant, selection: Record<string, string>) {
    const variantMap = getVariantAttributeMap(variant);

    return Object.entries(selection).every(([attributeName, value]) => {
        return variantMap[attributeName] === value;
    });
}

export default function ProductDetailPage() {
    const { productId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [specExpanded, setSpecExpanded] = useState(false);
    const [detailExpanded, setDetailExpanded] = useState(false);
    const [error, setError] = useState("");
    const [activeInfoTab, setActiveInfoTab] = useState<"specs" | "detail">("specs");

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

    const attributeGroups = useMemo(() => {
        return buildAttributeGroups(product?.product_variants ?? []);
    }, [product?.product_variants]);

    const galleryImages = useMemo(() => {
        return uniqueImages([
            ...getVariantImages(selectedVariant),
            ...getProductImages(product),
        ]);
    }, [product, selectedVariant]);

    const selectedImageIndex = Math.max(
        0,
        galleryImages.findIndex((image) => image.image_url === selectedImageUrl),
    );
    const maxThumbnailStartIndex = Math.max(0, galleryImages.length - THUMBNAILS_PER_PAGE);
    const visibleThumbnailImages = galleryImages.slice(
        thumbnailStartIndex,
        thumbnailStartIndex + THUMBNAILS_PER_PAGE
    );

    const availableQuantity = Math.max(
        0,
        Number(selectedVariant?.quantity_in_stock ?? 0) - Number(selectedVariant?.reserved_quantity ?? 0),
    );

    const displayName = selectedVariant?.variant_name || product?.product_name || "";
    const detailContent =
        selectedVariant?.detail_description
        || product?.description
        || "";
    const currentPrice = getVariantPrice(selectedVariant);
    const originalPrice = getVariantOriginalPrice(selectedVariant);
    const discountPercent = getDiscountPercent(originalPrice, currentPrice);

    useEffect(() => {
        if (!product) return;

        const queryVariantId = searchParams.get("variantId");
        if (!queryVariantId || queryVariantId === selectedVariantId) return;

        const matchedVariant = product.product_variants.find((variant) => variant.variant_id === queryVariantId);
        if (!matchedVariant) return;

        setSelectedVariantId(matchedVariant.variant_id);
        setQuantity(1);
    }, [product, searchParams, selectedVariantId]);

    useEffect(() => {
        setSelectedAttributes(getVariantAttributeMap(selectedVariant));
        setSelectedImageUrl(galleryImages[0]?.image_url ?? "");
        setThumbnailStartIndex(0);
        setDetailExpanded(false);
    }, [selectedVariant, galleryImages]);

    useEffect(() => {
        setThumbnailStartIndex((currentIndex) => Math.min(currentIndex, maxThumbnailStartIndex));
    }, [maxThumbnailStartIndex]);

    function selectVariant(variant: AdminProductVariant) {
        setSelectedVariantId(variant.variant_id);
        setQuantity(1);
        setSearchParams({ variantId: variant.variant_id });
    }

    function buildScopedSelection(attributeName: string, value: string) {
        const groupIndex = attributeGroups.findIndex((group) => group.name === attributeName);
        const scopedSelection: Record<string, string> = {};

        attributeGroups.slice(0, Math.max(groupIndex, 0)).forEach((group) => {
            const selectedValue = selectedAttributes[group.name];

            if (selectedValue) {
                scopedSelection[group.name] = selectedValue;
            }
        });

        scopedSelection[attributeName] = value;

        return scopedSelection;
    }

    function isAttributeOptionAvailable(attributeName: string, value: string) {
        const scopedSelection = buildScopedSelection(attributeName, value);

        return Boolean(
            product?.product_variants.some((variant) => variantMatchesSelection(variant, scopedSelection))
        );
    }

    function selectAttribute(attributeName: string, value: string) {
        const scopedSelection = buildScopedSelection(attributeName, value);
        const nextVariant = product?.product_variants.find((variant) => variantMatchesSelection(variant, scopedSelection));

        if (nextVariant) {
            selectVariant(nextVariant);
        }
    }

    function moveToImage(index: number) {
        if (galleryImages.length === 0) return;

        const nextIndex = (index + galleryImages.length) % galleryImages.length;

        setSelectedImageUrl(galleryImages[nextIndex].image_url);
        setThumbnailStartIndex((currentIndex) => {
            if (nextIndex < currentIndex) return nextIndex;
            if (nextIndex >= currentIndex + THUMBNAILS_PER_PAGE) {
                return Math.min(nextIndex - THUMBNAILS_PER_PAGE + 1, maxThumbnailStartIndex);
            }

            return currentIndex;
        });
    }

    function showPreviousImage() {
        if (galleryImages.length <= 1) return;

        moveToImage(selectedImageIndex - 1);
    }

    function showNextImage() {
        if (galleryImages.length <= 1) return;

        moveToImage(selectedImageIndex + 1);
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

    function handleBuyNow() {
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
            setBuyingNow(true);

            const buyNowItem = {
                variantId: selectedVariant.variant_id,
                productId: product?.product_id ?? "",
                quantity,
                price: currentPrice,
                name: displayName,
                sku: selectedVariant.sku ?? "",
                imageUrl: selectedImageUrl || galleryImages[0]?.image_url || "",
                attributes: Object.values(getVariantAttributeMap(selectedVariant)).filter(Boolean).join(", "),
            };

            sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));
            navigate("/checkout?mode=buy-now", {
                state: {
                    buyNowItem,
                },
            });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setBuyingNow(false);
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

    const specRows = selectedVariant?.product_variant_specs ?? [];
    const visibleSpecRows = specExpanded ? specRows : specRows.slice(0, 4);
    const canToggleSpecs = specRows.length > 4;
    const canToggleDetail = detailContent.length > 900;

    return (
        <section className="bg-[#f5f6fb]">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
                <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/" className="flex items-center gap-1 text-blue-700">
                        <Home className="h-4 w-4" />
                        Trang chủ
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span>{product.brands?.brand_name}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{product.categories?.category_name}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="line-clamp-1 text-foreground">{displayName}</span>
                </nav>

                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,58%)_minmax(360px,1fr)]">
                        <div>
                            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border bg-[#f7f7f7]">
                                {selectedImageUrl ? (
                                    <img
                                        src={selectedImageUrl}
                                        alt={displayName}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-sm text-muted-foreground">Chưa có ảnh sản phẩm</div>
                                )}
                            </div>

                            {galleryImages.length > 0 && (
                                <div className="mt-4 flex items-center justify-center gap-3">
                                    {galleryImages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={showPreviousImage}
                                            className="flex size-9 cursor-pointer shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:border-blue-700 hover:text-blue-700"
                                            aria-label="Ảnh trước"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                    )}

                                    <div className="grid min-w-0 flex-1 grid-cols-5 gap-3 overflow-hidden">
                                        {visibleThumbnailImages.map((image, offset) => {
                                            const imageIndex = thumbnailStartIndex + offset;
                                            const selected = image.image_url === selectedImageUrl;

                                            return (
                                                <button
                                                    key={`${image.image_id}-${image.image_url}`}
                                                    type="button"
                                                    onClick={() => moveToImage(imageIndex)}
                                                    className={cn(
                                                        "aspect-square cursor-pointer min-w-0 overflow-hidden rounded-md border bg-white p-1 transition hover:border-blue-600",
                                                        selected && "border-blue-700 ring-1 ring-blue-700",
                                                    )}
                                                >
                                                    <img
                                                        src={image.image_url}
                                                        alt={displayName}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {galleryImages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={showNextImage}
                                            className="flex size-9 cursor-pointer shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:border-blue-700 hover:text-blue-700"
                                            aria-label="Ảnh tiếp theo"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Truck className="mt-0.5 h-5 w-5 text-blue-700" />
                                    <span>Miễn phí giao hàng cho đơn hàng từ 5 triệu</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-700" />
                                    <span>Cam kết hàng chính hãng 100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Thương hiệu: <span className="font-medium text-blue-700">{product.brands?.brand_name}</span>
                                </p>
                                <h1 className="mt-2 text-2xl font-bold leading-tight text-[#1f2430] md:text-3xl">
                                    {displayName}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {selectedVariant?.sku && <span>SKU: {selectedVariant.sku}</span>}
                                    <span className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        0 <span className="text-blue-700">(0 đánh giá)</span>
                                    </span>
                                </div>
                            </div>

                            {attributeGroups.map((group) => (
                                <div key={group.name}>
                                    <p className="mb-2 font-medium">{group.name}</p>
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {group.options.map((option) => {
                                            const selected = selectedAttributes[group.name] === option.value;
                                            const available = isAttributeOptionAvailable(group.name, option.value);

                                            return (
                                                <button
                                                    key={`${group.name}-${option.value}`}
                                                    type="button"
                                                    disabled={!available}
                                                    onClick={() => selectAttribute(group.name, option.value)}
                                                    title={available ? option.value : "Biến thể này không có với lựa chọn hiện tại"}
                                                    className={cn(
                                                        "relative flex min-h-14 items-center justify-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition",
                                                        available
                                                            ? "cursor-pointer hover:border-blue-700 hover:bg-blue-50"
                                                            : "cursor-not-allowed opacity-40 grayscale",
                                                        selected && "border-blue-700 text-blue-700 ring-1 ring-blue-700",
                                                    )}
                                                >
                                                    {/* {option.imageUrl && option.value!=="Dung lượng" &&(
                                                        <img
                                                            src={option.imageUrl}
                                                            alt={option.value}
                                                            className="h-9 w-9 rounded object-contain"
                                                        />
                                                    )} */}
                                                    <span>{option.value}</span>
                                                    {selected && (
                                                        <span className="absolute bottom-0 right-0 h-0 w-0 border-b-[18px] border-l-[18px] border-b-blue-700 border-l-transparent" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="border-t pt-5">
                                <div className="flex flex-wrap items-end gap-3">
                                    {originalPrice && (
                                        <span className="text-base text-muted-foreground line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    )}
                                    {discountPercent && (
                                        <span className="text-sm font-medium text-red-600">-{discountPercent}%</span>
                                    )}
                                </div>
                                <p className="mt-1 text-4xl font-bold text-blue-700">
                                    {formatPrice(currentPrice)}
                                </p>
                                {selectedVariant?.active_promotion && (
                                    <p className="mt-2 inline-flex rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                        {selectedVariant.active_promotion.promotion_name}
                                    </p>
                                )}
                            </div>

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

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Button
                                    type="button"
                                    disabled={!selectedVariant || availableQuantity <= 0 || adding || buyingNow}
                                    onClick={handleAddToCart}
                                    className="h-12 w-full cursor-pointer bg-blue-700 text-base hover:bg-blue-800 disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                                </Button>

                                <Button
                                    type="button"
                                    disabled={!selectedVariant || availableQuantity <= 0 || adding || buyingNow}
                                    onClick={handleBuyNow}
                                    className="h-12 w-full cursor-pointer bg-red-600 text-base hover:bg-red-700 disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                                >
                                    {buyingNow ? "Đang xử lý..." : "Mua ngay"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 w-full rounded-lg bg-white p-4 shadow-sm lg:w-[58%]">
                    <div className="grid grid-cols-2 border-b text-center text-lg font-semibold">
                        <button
                            type="button"
                            onClick={() => setActiveInfoTab("specs")}
                            className={cn(
                                "px-6 py-3 cursor-pointer",
                                activeInfoTab === "specs"
                                    ? "border-b-2 border-blue-700 text-blue-700"
                                    : "text-muted-foreground"
                            )}
                        >
                            Thông số kỹ thuật
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveInfoTab("detail")}
                            className={cn(
                                "px-6 py-3 cursor-pointer",
                                activeInfoTab === "detail"
                                    ? "border-b-2 border-blue-700 text-blue-700"
                                    : "text-muted-foreground"
                            )}
                        >
                            Chi tiết sản phẩm
                        </button>
                    </div>

                    {activeInfoTab === "specs" && (
                        <div className="mt-4">
                            <h2 className="mb-3 font-semibold">Thông tin chung</h2>
                            <div className="overflow-hidden rounded-md border text-sm">
                                <SpecRow label="Thương hiệu" value={product.brands?.brand_name} shaded />
                                <SpecRow label="Bảo hành" value={`${product.warranty_period} tháng`} />
                                <SpecRow label="Nhóm sản phẩm" value={product.categories?.category_name} shaded />
                                <SpecRow label="Tên" value={product.product_name} />
                            </div>

                            {specRows.length > 0 && (
                                <>
                                    <h2 className="mb-3 mt-5 font-semibold">Thông số chi tiết</h2>
                                    <div className="overflow-hidden rounded-md border text-sm">
                                        {visibleSpecRows.map((spec, index) => (
                                            <SpecRow
                                                key={`${spec.spec_key}-${spec.spec_value}-${index}`}
                                                label={spec.spec_key}
                                                value={spec.spec_value}
                                                shaded={index % 2 === 0}
                                            />
                                        ))}
                                    </div>

                                    {canToggleSpecs && (
                                        <div className="mt-4 flex justify-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setSpecExpanded((value) => !value)}
                                                className="min-w-32 cursor-pointer rounded-full"
                                            >
                                                {specExpanded ? "Thu lại" : "Xem thêm"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {activeInfoTab === "detail" && (
                        <div className="mx-auto mt-5 max-w-3xl">
                            {detailContent ? (
                                <>
                                    <div
                                        className={cn(
                                            "relative overflow-hidden",
                                            canToggleDetail && !detailExpanded && "max-h-[520px]"
                                        )}
                                    >
                                        <BlogContent html={detailContent} />

                                        {canToggleDetail && !detailExpanded && (
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                                        )}
                                    </div>

                                    {canToggleDetail && (
                                        <div className="mt-4 flex justify-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setDetailExpanded((value) => !value)}
                                                className="min-w-32 cursor-pointer rounded-full"
                                            >
                                                {detailExpanded ? "Thu lại" : "Xem thêm"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Chưa có chi tiết sản phẩm.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function SpecRow({
    label,
    value,
    shaded,
}: {
    label: string;
    value?: string | number | null;
    shaded?: boolean;
}) {
    return (
        <div className={cn("grid grid-cols-[170px_minmax(0,1fr)] gap-4 px-4 py-3", shaded && "bg-muted/60")}>
            <span className="text-muted-foreground">{label}</span>
            <span className="whitespace-pre-line font-medium">{value || "-"}</span>
        </div>
    );
}
