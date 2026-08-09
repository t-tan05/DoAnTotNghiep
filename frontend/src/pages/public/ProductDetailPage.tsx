import PageLoading from "@/components/common/PageLoading";
import BlogContent from "@/components/blog/BlogContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAddCartItemMutation } from "@/hooks/queries/useCartQueries";
import { useProductDetailQuery, useRelatedProductsQuery } from "@/hooks/queries/useProductQueries";
import { useToggleWishlistMutation, useWishlistCheckQuery } from "@/hooks/queries/useWishlistQueries";
import { cn } from "@/lib/utils";
import type { AdminProduct, PublicProductCardItem } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { addCompareItem, COMPARE_CHANGED_EVENT, getCompareItems } from "@/utils/compareStorage";
import { isStaffUser } from "@/utils/authRole";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ChevronLeft, ChevronRight, Heart, Home, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck, Shuffle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ProductReviews from "@/components/prod/ProductReviews";
import type { ProductReviewSummary } from "@/types/review.type";
import HomeProductCard from "@/components/home/HomeProductCard";

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
const RELATED_PRODUCTS_PER_PAGE = 4;

function chunkItems<T>(items: T[], size: number) {
    const chunks: T[][] = [];

    for(let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

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

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d")
        .replace(/\u0110/g, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function cmsHref(...parts: Array<string | null | undefined>) {
    const slug = parts
        .filter((part): part is string => Boolean(part))
        .map(slugify)
        .filter(Boolean)
        .join("-");

    return slug ? `/c/${slug}` : "/";
}

type ProductBreadcrumbItem = {
    label: string;
    href: string;
};

function buildProductBreadcrumbItems(product: AdminProduct, displayName: string): ProductBreadcrumbItem[] {
    const categoryName = product.categories?.category_name ?? "";
    const brandName = product.brands?.brand_name ?? "";
    const lineName = product.product_lines?.line_name ?? "";
    const lineSlug = product.product_lines?.slug ?? lineName;
    const categorySlug = slugify(categoryName);
    const brandSlug = slugify(brandName);
    const lineSlugValue = slugify(lineSlug);
    const items: ProductBreadcrumbItem[] = [];

    function push(label: string, href: string) {
        if(!label) return;
        if(items.some((item) => item.label === label || item.href === href)) return;
        items.push({ label, href });
    }

    if(categorySlug.includes("laptop") || categorySlug.includes("may-tinh-laptop")) {
        push("Laptop", "/c/laptop");

        if(brandName) {
            push(brandName, `/c/laptop-${brandSlug}`);
        }

        if(lineName && lineSlugValue && lineSlugValue !== brandSlug) {
            push(lineName, `/c/laptop-${brandSlug}-${lineSlugValue}`);
        }
    }else if(categorySlug.includes("phu-kien") || ["chuot-may-tinh", "ban-phim"].includes(lineSlugValue)) {
        push("Phụ kiện máy tính", "/c/phu-kien-may-tinh");

        if(lineSlugValue.includes("chuot")) {
            push("Chuột máy tính", "/c/chuot-may-tinh");
        }else if(lineSlugValue.includes("ban-phim")) {
            push("Bàn phím", "/c/ban-phim");
        }else if(lineName) {
            push(lineName, `/c/${lineSlugValue}`);
        }
    }else if(categorySlug.includes("am-thanh") || ["tai-nghe", "loa-nghe-nhac"].includes(lineSlugValue)) {
        push("Thiết bị âm thanh", "/c/thiet-bi-am-thanh");

        if(lineSlugValue.includes("tai-nghe")) {
            push("Tai nghe", "/c/tai-nghe");
        }else if(lineSlugValue.includes("loa")) {
            push("Loa nghe nhạc", "/c/loa-nghe-nhac");
        }else if(lineName) {
            push(lineName, `/c/${lineSlugValue}`);
        }
    }else {
        push(categoryName, cmsHref(categoryName));

        if(brandName) {
            push(brandName, cmsHref(brandName));
        }

        if(lineName) {
            push(lineName, cmsHref(lineSlug));
        }
    }

    items.push({ label: displayName, href: "" });

    return items;
}

export default function ProductDetailPage() {
    const { productId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const isStaff = isStaffUser(user);

    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [buyingNow, setBuyingNow] = useState(false);
    const [specExpanded, setSpecExpanded] = useState(false);
    const [detailExpanded, setDetailExpanded] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState<"specs" | "detail">("specs");
    const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary | null> (null);
    const [relatedPage, setRelatedPage] = useState(0);
    const [comparedVariantIds, setComparedVariantIds] = useState<string[]>(() => (
        getCompareItems().map((item) => item.variantId)
    ));
    const productQuery = useProductDetailQuery(productId);
    const relatedProductsQuery = useRelatedProductsQuery(productId);
    const product = productQuery.data?.product ?? null;
    const relatedProducts: PublicProductCardItem[] = relatedProductsQuery.data?.products ?? [];
    const addCartItemMutation = useAddCartItemMutation();
    const toggleWishlistMutation = useToggleWishlistMutation();

    useEffect(() => {
        const variants = product?.product_variants ?? [];
        const queryVariantId = searchParams.get("variantId");
        const matchedVariant = variants.find((variant) => variant.variant_id === queryVariantId);

        setSelectedVariantId(matchedVariant?.variant_id ?? variants[0]?.variant_id ?? "");
        setQuantity(1);
    }, [product?.product_id]);

    const selectedVariant = useMemo(() => {
        return product?.product_variants.find((variant) => variant.variant_id === selectedVariantId) ?? null;
    }, [product?.product_variants, selectedVariantId]);
    const wishlistQuery = useWishlistCheckQuery(selectedVariant?.variant_id, {
        enabled: isAuthenticated && !isStaff,
    });
    const isWishlisted = Boolean(wishlistQuery.data?.isWishlisted);
    const wishlistLoading = wishlistQuery.isFetching || toggleWishlistMutation.isPending;
    const adding = addCartItemMutation.isPending;
    const relatedLoading = relatedProductsQuery.isLoading;

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
    const isOutOfStock = !selectedVariant || availableQuantity <= 0;

    const displayName = selectedVariant?.variant_name || product?.product_name || "";
    const detailContent =
        selectedVariant?.detail_description
        || product?.description
        || "";
    const currentPrice = getVariantPrice(selectedVariant);
    const originalPrice = getVariantOriginalPrice(selectedVariant);
    const discountPercent = getDiscountPercent(originalPrice, currentPrice);
    const relatedPages = useMemo(() => chunkItems(relatedProducts, RELATED_PRODUCTS_PER_PAGE), [relatedProducts]);
    const relatedTotalPages = relatedPages.length;
    const currentRelatedPage = Math.min(relatedPage, Math.max(relatedTotalPages - 1, 0));
    const canSlideRelated = relatedTotalPages > 1;
    const isFirstRelatedPage = currentRelatedPage <= 0;
    const isLastRelatedPage = currentRelatedPage >= relatedTotalPages - 1;

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
        setRelatedPage(0);
    }, [productId, relatedProducts.length]);

    useEffect(() => {
        setThumbnailStartIndex((currentIndex) => Math.min(currentIndex, maxThumbnailStartIndex));
    }, [maxThumbnailStartIndex]);

    useEffect(() => {
        function syncComparedItems() {
            setComparedVariantIds(getCompareItems().map((item) => item.variantId));
        }

        window.addEventListener(COMPARE_CHANGED_EVENT, syncComparedItems);
        window.addEventListener("storage", syncComparedItems);

        return () => {
            window.removeEventListener(COMPARE_CHANGED_EVENT, syncComparedItems);
            window.removeEventListener("storage", syncComparedItems);
        };
    }, []);

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

    async function handleToggleWishlist() {
        if(isStaff) return;
        if(!selectedVariant) return;

        if(!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            });
            return;
        }

        try {
            const data = await toggleWishlistMutation.mutateAsync({
                variantId: selectedVariant.variant_id,
                isWishlisted,
            });
            toast.success(
                data?.isWishlisted
                    ? "Đã thêm vào sản phẩm yêu thích."
                    : "Đã bỏ khỏi sản phẩm yêu thích.",
            );
        } catch(error) {
            toast.error(getErrorMessage(error));
        }
    }

    async function handleAddToCart() {
        if(isStaff) return;
        if (!selectedVariant) return;
        if (isOutOfStock) return;

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            });
            return;
        }

        try {
            await addCartItemMutation.mutateAsync({
                variantId: selectedVariant.variant_id,
                quantity,
            });
            toast.success("Đã thêm sản phẩm vào giỏ hàng.");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    function handleBuyNow() {
        if(isStaff) return;
        if (!selectedVariant) return;
        if (isOutOfStock) return;

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

    function handleAddToCompare() {
        if(!product || !selectedVariant) return;

        const result = addCompareItem({
            productId: product.product_id,
            variantId: selectedVariant.variant_id,
        });

        if(!result.success && result.reason === "limit") {
            toast.error("Chỉ có thể so sánh tối đa 3 sản phẩm.");
            return;
        }

        if(result.reason === "exists") {
            setComparedVariantIds(result.items.map((item) => item.variantId));
            toast.info("Sản phẩm đã có trong danh sách so sánh.");
            return;
        }

        setComparedVariantIds(result.items.map((item) => item.variantId));
        toast.success("Đã thêm vào danh sách so sánh.");
    }

    if (productQuery.isLoading) return <PageLoading text="Đang tải sản phẩm..." />;

    if (productQuery.error) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
                <div className="rounded-lg border bg-red-50 p-4 text-red-600">
                    {getErrorMessage(productQuery.error)}
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
    const breadcrumbItems = buildProductBreadcrumbItems(product, displayName);
    const isCompared = Boolean(selectedVariant?.variant_id && comparedVariantIds.includes(selectedVariant.variant_id));

    return (
        <section className="bg-[#f5f6fb]">
            <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
                <nav className="mb-4 flex min-h-11 items-center gap-2 overflow-x-auto bg-[#eef1f8] px-3 text-sm text-[#747c96] md:px-6">
                    <Link to="/" className="flex shrink-0 items-center gap-2 text-blue-600 transition hover:text-blue-800">
                        <Home className="h-4 w-4 opacity-50" />
                        Trang chủ
                    </Link>

                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1;

                        return (
                            <span key={`${item.label}-${index}`} className="flex min-w-0 shrink-0 items-center gap-2">
                                <ChevronRight className="h-4 w-4 shrink-0 text-[#a5abc0]" />
                                {isLast || !item.href ? (
                                    <span className="max-w-[520px] truncate text-[#68708c]">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.href}
                                        className="whitespace-nowrap text-blue-600 transition hover:text-blue-800"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </span>
                        );
                    })}
                </nav>

                <div className="rounded-lg bg-white p-3 shadow-sm md:p-4">
                    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,58%)_minmax(360px,1fr)] lg:gap-8">
                        <div className="min-w-0">
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
                                <div className="mt-3 flex min-w-0 items-center justify-center gap-2 md:mt-4 md:gap-3">
                                    {galleryImages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={showPreviousImage}
                                            className="flex size-8 cursor-pointer shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:border-blue-700 hover:text-blue-700 md:size-9"
                                            aria-label="Ảnh trước"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                    )}

                                    <div className="flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto pb-1 sm:justify-center md:gap-3 md:overflow-hidden md:pb-0">
                                        {visibleThumbnailImages.map((image, offset) => {
                                            const imageIndex = thumbnailStartIndex + offset;
                                            const selected = image.image_url === selectedImageUrl;

                                            return (
                                                <button
                                                    key={`${image.image_id}-${image.image_url}`}
                                                    type="button"
                                                    onClick={() => moveToImage(imageIndex)}
                                                    className={cn(
                                                        "size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-white p-1 transition hover:border-blue-600 sm:size-20 md:size-24",
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
                                            className="flex size-8 cursor-pointer shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:border-blue-700 hover:text-blue-700 md:size-9"
                                            aria-label="Ảnh tiếp theo"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 grid gap-3 rounded-md border p-3 text-xs sm:grid-cols-2 md:mt-6 md:p-4 md:text-sm">
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

                        <div className="min-w-0 space-y-4 md:space-y-5">
                            <div className="min-w-0">
                                <h1 className="mt-2 break-words text-xl font-bold leading-tight text-[#1f2430] md:text-3xl">
                                    {displayName}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span>
                                        Thương hiệu: <span className="font-medium text-blue-700">{product.brands?.brand_name}</span>
                                    </span>
                                    {selectedVariant?.sku && <span>SKU: {selectedVariant.sku}</span>}
                                    <span className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        {reviewSummary && reviewSummary.totalReviews > 0 ? (
                                            <>
                                                {reviewSummary.averageRating.toFixed(1)}
                                                <span className="text-blue-700">
                                                    ({reviewSummary.totalReviews} đánh giá)
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                0 <span className="text-blue-700">(0 đánh giá)</span>
                                            </>
                                        )}
                                    </span>
                                    {isCompared ? (
                                        <span className="flex items-center gap-1 font-medium text-green-700">
                                            <Shuffle className="size-4" />
                                            Đã thêm so sánh
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleAddToCompare}
                                            className="flex cursor-pointer items-center gap-1 font-medium text-green-700 transition hover:text-green-800"
                                        >
                                            <Shuffle className="size-4" />
                                            So sánh
                                        </button>
                                    )}
                                </div>
                            </div>

                            {attributeGroups.map((group) => (
                                <div key={group.name}>
                                    <p className="mb-2 font-medium">{group.name}</p>
                                    <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                                                        "relative flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition md:min-h-14",
                                                        available
                                                            ? "cursor-pointer hover:border-blue-700 hover:bg-blue-50"
                                                            : "cursor-not-allowed opacity-40 grayscale",
                                                        selected && "border-blue-700 text-blue-700 ring-1 ring-blue-700",
                                                    )}
                                                >
                                                    <span className="truncate">{option.value}</span>
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
                                <p className="mt-1 text-3xl font-bold text-blue-700 md:text-4xl">
                                    {formatPrice(currentPrice)}
                                </p>
                            </div>

                            {!isStaff && (
                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
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
                            )}

                            {!isStaff && (
                            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                                {isOutOfStock ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="h-12 font-bold w-full cursor-not-allowed bg-muted text-base text-muted-foreground sm:col-span-2"
                                    >
                                        Hết hàng
                                    </button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            disabled={adding || buyingNow}
                                            onClick={handleAddToCart}
                                            className="h-12 w-full cursor-pointer bg-blue-700 text-base hover:bg-blue-800 disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                                        </Button>

                                        <Button
                                            type="button"
                                            disabled={adding || buyingNow}
                                            onClick={handleBuyNow}
                                            className="h-12 w-full cursor-pointer bg-red-600 text-base hover:bg-red-700 disabled:!pointer-events-auto disabled:!cursor-not-allowed"
                                        >
                                            {buyingNow ? "Đang xử lý..." : "Mua ngay"}
                                        </Button>
                                    </>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!selectedVariant || wishlistLoading}
                                    onClick={handleToggleWishlist}
                                    className="h-12 w-full cursor-pointer gap-2 border-blue-700 text-base text-blue-700 hover:bg-blue-50 disabled:!pointer-events-auto disabled:!cursor-not-allowed sm:col-span-2"
                                >
                                    <Heart
                                        className={cn(
                                            "h-5 w-5",
                                            isWishlisted && "fill-blue-700",
                                        )}
                                    />
                                    {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
                                </Button>
                            </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 w-full rounded-lg bg-white p-3 shadow-sm md:p-4 lg:w-[58%]">
                    <div className="grid grid-cols-2 border-b text-center text-sm font-semibold md:text-lg">
                        <button
                            type="button"
                            onClick={() => setActiveInfoTab("specs")}
                            className={cn(
                                "cursor-pointer px-2 py-3 md:px-6",
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
                                "cursor-pointer px-2 py-3 md:px-6",
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

                {(relatedLoading || relatedProducts.length > 0) && (
                    <section className="group/related mt-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold">Sản phẩm liên quan</h2>
                            {relatedProducts.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {relatedProducts.length} sản phẩm
                                </span>
                            )}
                        </div>

                        {relatedLoading ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: RELATED_PRODUCTS_PER_PAGE }).map((_, index) => (
                                    <div key={index} className="h-[430px] animate-pulse rounded-md bg-muted" />
                                ))}
                            </div>
                        ) : (
                            <div className="relative">
                                {canSlideRelated && (
                                    <button
                                        type="button"
                                        disabled={isFirstRelatedPage}
                                        onClick={() => setRelatedPage((current) => Math.max(0, current - 1))}
                                        className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/related:opacity-100 group-hover/related:disabled:opacity-35"
                                        aria-label="Xem sản phẩm liên quan trước"
                                    >
                                        <ChevronLeft className="size-6" />
                                    </button>
                                )}

                                <div className="overflow-hidden">
                                    <div
                                        className="flex flex-nowrap transition-all duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentRelatedPage * 100}%)` }}
                                    >
                                        {relatedPages.map((page, pageIndex) => (
                                            <div
                                                key={`related-page-${pageIndex}`}
                                                className="grid min-w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
                                            >
                                                {page.map((item) => (
                                                    <HomeProductCard
                                                        key={`${item.product_id}-${item.variant.variant_id}`}
                                                        product={item}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {canSlideRelated && (
                                    <button
                                        type="button"
                                        disabled={isLastRelatedPage}
                                        onClick={() => setRelatedPage((current) => Math.min(relatedTotalPages - 1, current + 1))}
                                        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-1/3 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/related:opacity-100 group-hover/related:disabled:opacity-35"
                                        aria-label="Xem sản phẩm liên quan tiếp theo"
                                    >
                                        <ChevronRight className="size-6" />
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* Review */}
                <ProductReviews
                    productId={product.product_id}
                    onSummaryChange={setReviewSummary}
                />
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
        <div className={cn("grid gap-1 px-3 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4 sm:px-4 md:grid-cols-[170px_minmax(0,1fr)]", shaded && "bg-muted/60")}>
            <span className="text-muted-foreground">{label}</span>
            <span className="min-w-0 whitespace-pre-line break-words font-medium">{value || "-"}</span>
        </div>
    );
}
