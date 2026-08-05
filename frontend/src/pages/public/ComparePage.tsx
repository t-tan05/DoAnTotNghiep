import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import {
    clearCompareItems,
    COMPARE_CHANGED_EVENT,
    getCompareItems,
    removeCompareItem,
    type CompareItem,
} from "@/utils/compareStorage";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type CompareProduct = {
    product: AdminProduct;
    variant: AdminProductVariant;
};

function formatPrice(value: number | string | null | undefined) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getVariantImage(variant: AdminProductVariant, product: AdminProduct) {
    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        product.product_images?.find((image) => image.is_default)?.image_url ||
        product.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantPrice(variant: AdminProductVariant) {
    return Number(variant.discount_price ?? variant.price ?? 0);
}

function getVariantOriginalPrice(variant: AdminProductVariant) {
    const originalPrice = Number(variant.original_price ?? variant.price ?? 0);
    const currentPrice = getVariantPrice(variant);

    return originalPrice > currentPrice ? originalPrice : null;
}

function getSpecMap(variant: AdminProductVariant) {
    const map = new Map<string, string>();

    variant.product_variant_specs
        ?.slice()
        .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
        .forEach((spec) => {
            if(spec.spec_key) {
                map.set(spec.spec_key, spec.spec_value || "-");
            }
        });

    return map;
}

function getAllSpecKeys(products: CompareProduct[]) {
    const keys: string[] = [];

    products.forEach(({ variant }) => {
        variant.product_variant_specs
            ?.slice()
            .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
            .forEach((spec) => {
                if(spec.spec_key && !keys.includes(spec.spec_key)) {
                    keys.push(spec.spec_key);
                }
            });
    });

    return keys;
}

export default function ComparePage() {
    const [compareItems, setCompareItemsState] = useState<CompareItem[]>(() => getCompareItems());
    const [products, setProducts] = useState<CompareProduct[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadCompareProducts(items = getCompareItems()) {
        try {
            setLoading(true);

            const results = await Promise.all(
                items.map(async(item) => {
                    const data = await productService.getById(item.productId);
                    const product = data?.product;
                    const variant = product?.product_variants.find((row) => row.variant_id === item.variantId);

                    if(!product || !variant) return null;

                    return {
                        product,
                        variant,
                    };
                }),
            );

            setProducts(results.filter((item): item is CompareProduct => Boolean(item)));
        }catch(error) {
            toast.error(getErrorMessage(error));
            setProducts([]);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCompareProducts(compareItems);

        function handleCompareChanged() {
            const nextItems = getCompareItems();
            setCompareItemsState(nextItems);
            loadCompareProducts(nextItems);
        }

        window.addEventListener(COMPARE_CHANGED_EVENT, handleCompareChanged);

        return () => {
            window.removeEventListener(COMPARE_CHANGED_EVENT, handleCompareChanged);
        };
    }, []);

    const specKeys = useMemo(() => getAllSpecKeys(products), [products]);

    function handleRemove(variantId: string) {
        removeCompareItem(variantId);
    }

    function handleClear() {
        clearCompareItems();
    }

    if(loading) {
        return <PageLoading text="Đang tải sản phẩm so sánh..." />;
    }

    if(products.length === 0) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-lg border bg-white p-8 text-center">
                    <h1 className="text-2xl font-bold">So sánh sản phẩm</h1>
                    <p className="mt-2 text-muted-foreground">
                        Chưa có sản phẩm nào trong danh sách so sánh.
                    </p>
                    <Button asChild className="mt-5 cursor-pointer">
                        <Link to="/c/laptop">Xem sản phẩm</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">So sánh sản phẩm</h1>
                    <p className="text-sm text-muted-foreground">
                        Tối đa 3 sản phẩm trong một lần so sánh.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="cursor-pointer gap-2"
                >
                    <Trash2 className="size-4" />
                    Xóa tất cả
                </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white">
                <div
                    className="grid min-w-[900px]"
                    style={{
                        gridTemplateColumns: `220px repeat(${products.length}, minmax(220px, 1fr))`,
                    }}
                >
                    <div className="border-b bg-muted p-4 font-semibold">
                        Sản phẩm
                    </div>

                    {products.map(({ product, variant }) => {
                        const image = getVariantImage(variant, product);
                        const originalPrice = getVariantOriginalPrice(variant);

                        return (
                            <div key={variant.variant_id} className="relative border-b border-l p-4">
                                <button
                                    type="button"
                                    onClick={() => handleRemove(variant.variant_id)}
                                    className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white text-muted-foreground hover:text-red-600"
                                    aria-label="Xóa khỏi so sánh"
                                >
                                    <X className="size-4" />
                                </button>

                                <Link to={`/products/${product.product_id}?variantId=${variant.variant_id}`}>
                                    <div className="mx-auto flex h-40 items-center justify-center">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={variant.variant_name || product.product_name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No image</div>
                                        )}
                                    </div>

                                    <h2 className="mt-3 line-clamp-2 pr-8 font-medium hover:text-blue-700">
                                        {variant.variant_name || product.product_name}
                                    </h2>
                                </Link>

                                <p className="mt-2 font-bold text-blue-700">
                                    {formatPrice(getVariantPrice(variant))}
                                </p>

                                {originalPrice ? (
                                    <p className="text-sm text-muted-foreground line-through">
                                        {formatPrice(originalPrice)}
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}

                    <div className="border-b bg-muted p-4 font-semibold">
                        Loại
                    </div>

                    {products.map(({ product, variant }) => (
                        <div key={`${variant.variant_id}-type`} className="border-b border-l p-4 text-sm">
                            <p>Loại: {product.categories?.category_name || "-"}</p>
                            <p>Nhà cung cấp: {product.brands?.brand_name || "-"}</p>
                            <p>Bảo hành: {product.warranty_period || 0} tháng</p>
                        </div>
                    ))}

                    <div className="col-span-full border-b bg-muted p-4 font-semibold">
                        Thông số kỹ thuật
                    </div>

                    {specKeys.map((specKey) => (
                        <div key={specKey} className="contents">
                            <div className="border-b bg-white p-4 font-semibold">
                                {specKey}
                            </div>

                            {products.map(({ variant }) => {
                                const specMap = getSpecMap(variant);

                                return (
                                    <div key={`${variant.variant_id}-${specKey}`} className="border-b border-l p-4">
                                        {specMap.get(specKey) || "-"}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}