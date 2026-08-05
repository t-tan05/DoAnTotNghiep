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
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type CompareBarProduct = {
    product: AdminProduct;
    variant: AdminProductVariant;
};

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

export default function CompareBar() {
    const [items, setItems] = useState<CompareItem[]>(() => getCompareItems());
    const [products, setProducts] = useState<CompareBarProduct[]>([]);
    const [hidden, setHidden] = useState(false);
    const itemKeysRef = useRef(items.map((item) => item.variantId));

    async function loadProducts(nextItems = getCompareItems()) {
        setItems(nextItems);
        itemKeysRef.current = nextItems.map((item) => item.variantId);

        if(nextItems.length === 0) {
            setProducts([]);
            return;
        }

        const results = await Promise.all(
            nextItems.map(async(item) => {
                try {
                    const data = await productService.getById(item.productId);
                    const product = data?.product;
                    const variant = product?.product_variants.find((row) => row.variant_id === item.variantId);

                    if(!product || !variant) return null;

                    return { product, variant };
                }catch{
                    return null;
                }
            }),
        );

        setProducts(results.filter((item): item is CompareBarProduct => Boolean(item)));
    }

    useEffect(() => {
        loadProducts(items);

        function handleCompareChanged() {
            const nextItems = getCompareItems();
            const hasNewItem = nextItems.some((item) => !itemKeysRef.current.includes(item.variantId));

            if(hasNewItem) {
                setHidden(false);
            }

            loadProducts(nextItems);
        }

        window.addEventListener(COMPARE_CHANGED_EVENT, handleCompareChanged);
        window.addEventListener("storage", handleCompareChanged);

        return () => {
            window.removeEventListener(COMPARE_CHANGED_EVENT, handleCompareChanged);
            window.removeEventListener("storage", handleCompareChanged);
        };
    }, []);

    if(items.length === 0 || hidden) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white shadow-2xl">
            <div className="mx-auto flex max-w-7xl items-stretch gap-4 px-4 py-3">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map(({ product, variant }) => {
                        const image = getVariantImage(variant, product);
                        const displayName = variant.variant_name || product.product_name;

                        return (
                            <div key={variant.variant_id} className="relative flex min-h-32 items-center gap-3 border p-3">
                                <button
                                    type="button"
                                    onClick={() => removeCompareItem(variant.variant_id)}
                                    className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center text-muted-foreground hover:text-red-600"
                                    aria-label="Xóa khỏi so sánh"
                                >
                                    <X className="size-4" />
                                </button>

                                <Link
                                    to={`/products/${product.product_id}?variantId=${variant.variant_id}`}
                                    className="flex size-20 shrink-0 items-center justify-center"
                                >
                                    {image ? (
                                        <img src={image} alt={displayName} className="h-full w-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    )}
                                </Link>

                                <Link
                                    to={`/products/${product.product_id}?variantId=${variant.variant_id}`}
                                    className="line-clamp-3 min-w-0 pr-4 text-center text-sm hover:text-blue-700"
                                >
                                    {displayName}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div className="flex w-44 shrink-0 flex-col items-stretch justify-center gap-2">
                    <Button asChild variant="outline" className="h-11 cursor-pointer border-green-700 text-green-700 hover:bg-green-50 hover:text-green-800">
                        <Link to="/so-sanh">So sánh ngay</Link>
                    </Button>

                    <button
                        type="button"
                        onClick={clearCompareItems}
                        className="cursor-pointer text-sm text-muted-foreground hover:text-red-600"
                    >
                        Xóa tất cả sản phẩm
                    </button>

                    <button
                        type="button"
                        onClick={() => setHidden(true)}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                    >
                        Thu gọn <ChevronDown className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
