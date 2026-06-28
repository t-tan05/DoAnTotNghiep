import ProductCard from "@/components/prod/ProductCard";
import ProductFilterSidebar from "@/components/prod/ProductFilterSidebar";
import ProductSortBar from "@/components/prod/ProductSortBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/product.service";
import type {
    PublicProductCardItem,
    PublicProductFilterOption,
} from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";


export default function ProductListPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<PublicProductCardItem[]>([]);
    const [brands, setBrands] = useState<PublicProductFilterOption[]>([]);
    const [categories, setCategories] = useState<PublicProductFilterOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const page = Number(searchParams.get("page") || 1);
    const search = searchParams.get("search") || "";
    const brandId = searchParams.get("brandId") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    function updateParam(key: string, value: string) {
        const next = new URLSearchParams(searchParams);

        if(value) {
            next.set(key, value);
        }else {
            next.delete(key);
        }

        if(key !== "page") {
            next.set("page", "1");
        }

        setSearchParams(next);
    }

    function clearFilters() {
        const next = new URLSearchParams();

        if (search) {
            next.set("search", search);
        }

        setSearchParams(next);
    }

    async function loadProducts() {
        try {
            setLoading(true);

            const data = await productService.getAllPublic({
                page,
                limit: 20,
                search: search || undefined,
                brandId: brandId || undefined,
                categoryId: categoryId || undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: sortBy as any,
            });

            setProducts(data.products);
            setBrands(data.filters.brands);
            setCategories(data.filters.categories);
            setTotalItems(data.meta.pagination.totalItems);
            setTotalPages(data.meta.pagination.totalPages);
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadProducts();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchParams]);

    return (
        <main className="bg-[#f5f6fb] py-6">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">Sản phẩm</h1>
                    <p className="text-sm text-muted-foreground">
                        Tìm kiếm và lựa chọn sản phẩm phù hợp với nhu cầu của bạn.
                    </p>
                </div>

                <div className="mb-4 rounded-md border bg-white p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => updateParam("search", e.target.value)}
                            placeholder="Bạn muốn mua gì hôm nay?"
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                    <div className="hidden lg:block">
                        <ProductFilterSidebar
                            brands={brands}
                            categories={categories}
                            brandId={brandId}
                            categoryId={categoryId}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onBrandChange={(value) => updateParam("brandId", value)}
                            onCategoryChange={(value) => updateParam("categoryId", value)}
                            onMinPriceChange={(value) => updateParam("minPrice", value)}
                            onMaxPriceChange={(value) => updateParam("maxPrice", value)}
                            onClear={clearFilters}
                        />
                    </div>

                    <section className="space-y-4">
                        <ProductSortBar
                            totalItems={totalItems}
                            sortBy={sortBy}
                            onSortChange={(value) => updateParam("sortBy", value)}
                        />

                        {loading ? (
                            <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
                                Đang tải sản phẩm...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-md border bg-white p-8 text-center">
                                <h2 className="font-semibold">
                                    Không tìm thấy sản phẩm phù hợp
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hãy thử thay đổi từ khóa hoặc bỏ bớt bộ lọc.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="mt-4 cursor-pointer"
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={`${product.product_id}-${product.variant.variant_id}`}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={page <= 1}
                                onClick={() => updateParam("page", String(page - 1))}
                            >
                                Trước
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                Trang {page} / {Math.max(totalPages, 1)}
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={page >= totalPages}
                                onClick={() => updateParam("page", String(page + 1))}
                            >
                                Sau
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}