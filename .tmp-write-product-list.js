const fs = require('fs');
const path = 'frontend/src/pages/public/ProductListPage.tsx';
const content = String.raw`import PublicCmsSections from "@/components/cms/PublicCmsSections";
import ProductCard from "@/components/prod/ProductCard";
import ProductFilterSidebar from "@/components/prod/ProductFilterSidebar";
import ProductSortBar from "@/components/prod/ProductSortBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { cmsService } from "@/services/cms.service";
import { productService } from "@/services/product.service";
import { wishlistService } from "@/services/wishlist.service";
import type { CmsCollection } from "@/types/cms.type";
import type {
    PublicProductCardItem,
    PublicProductFilterOption,
} from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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

function normalizeCmsSlug(value: string) {
    const trimmed = value.trim();
    if(!trimmed) return "";

    if(trimmed.startsWith("/")) {
        return trimmed;
    }

    return "/" + slugify(trimmed);
}

export default function ProductListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const [products, setProducts] = useState<PublicProductCardItem[]>([]);
    const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
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
    const cmsParam = searchParams.get("cms") || "";

    const [draftSearch, setDraftSearch] = useState(search);
    const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
    const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

    const [maxAvailablePrice, setMaxAvailablePrice] = useState(0);
    const [cmsCollection, setCmsCollection] = useState<CmsCollection | null>(null);
    const [cmsLoading, setCmsLoading] = useState(false);

    const cmsSlug = normalizeCmsSlug(cmsParam || search);

    useEffect(() => {
        setDraftSearch(search);
        setDraftMinPrice(minPrice);
        setDraftMaxPrice(maxPrice);
    }, [search, minPrice, maxPrice]);

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
        setSearchParams(new URLSearchParams());
    }

    function applyFilters() {
        const next = new URLSearchParams(searchParams);

        if(draftSearch.trim()) {
            next.set("search", draftSearch.trim());
        }else {
            next.delete("search");
        }

        if(draftMinPrice) {
            next.set("minPrice", draftMinPrice);
        }else {
            next.delete("minPrice");
        }

        if(draftMaxPrice) {
            next.set("maxPrice", draftMaxPrice);
        }else {
            next.delete("maxPrice");
        }

        next.set("page", "1");
        setSearchParams(next);
    }

    function applyPriceRange(nextMinPrice: string, nextMaxPrice: string) {
        const next = new URLSearchParams(searchParams);

        if(draftSearch.trim()) {
            next.set("search", draftSearch.trim());
        }else {
            next.delete("search");
        }

        if(nextMinPrice) {
            next.set("minPrice", nextMinPrice);
        }else {
            next.delete("minPrice");
        }

        if(nextMaxPrice) {
            next.set("maxPrice", nextMaxPrice);
        }else {
            next.delete("maxPrice");
        }

        next.set("page", "1");
        setDraftMinPrice(nextMinPrice);
        setDraftMaxPrice(nextMaxPrice);
        setSearchParams(next);
    }

    async function loadCmsCollection() {
        if(!cmsSlug) {
            setCmsCollection(null);
            return;
        }

        try {
            setCmsLoading(true);
            const data = await cmsService.getPublicCollection(cmsSlug);
            setCmsCollection(data);
        }catch{
            setCmsCollection(null);
        }finally{
            setCmsLoading(false);
        }
    }

    async function loadProducts() {
        try {
            setLoading(true);

            const effectiveBrandId = brandId || cmsCollection?.brand_id || "";
            const effectiveCategoryId = categoryId || cmsCollection?.category_id || "";

            const data = await productService.getAllPublic({
                page,
                limit: 20,
                search: search || undefined,
                brandId: effectiveBrandId || undefined,
                categoryId: effectiveCategoryId || undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: sortBy as any,
            });

            setMaxAvailablePrice(Number(data.filters.maxPrice ?? 0));

            if(!searchParams.has("minPrice")) {
                setDraftMinPrice("0");
            }

            if(!searchParams.has("maxPrice")) {
                setDraftMaxPrice(String(Number(data.filters.maxPrice ?? 0)));
            }

            setProducts(data.products);
            setBrands(data.filters.brands);
            setCategories(data.filters.categories);
            setTotalItems(data.meta.pagination.totalItems);
            setTotalPages(data.meta.pagination.totalPages);

            if(isAuthenticated && data.products.length > 0) {
                try {
                    const variantIds = data.products.map((product) => product.variant.variant_id);
                    const wishlistData = await wishlistService.checkMany(variantIds);

                    setWishlistMap(wishlistData?.items ?? {});
                } catch {
                    setWishlistMap({});
                }
            }else {
                setWishlistMap({});
            }
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
    }, [searchParams, isAuthenticated, cmsCollection?.brand_id, cmsCollection?.category_id]);

    useEffect(() => {
        loadCmsCollection();
    }, [cmsSlug]);

    return (
        <main className="bg-[#f5f6fb] py-6">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">{cmsCollection?.title || "S\u1ea3n ph\u1ea9m"}</h1>
                    <p className="text-sm text-muted-foreground">
                        {cmsCollection?.description || "T\u00ecm ki\u1ebfm v\u00e0 l\u1ef1a ch\u1ecdn s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p v\u1edbi nhu c\u1ea7u c\u1ee7a b\u1ea1n."}
                    </p>
                </div>

                <div className="hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => updateParam("search", e.target.value)}
                            placeholder="B\u1ea1n mu\u1ed1n mua g\u00ec h\u00f4m nay?"
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
                            search={draftSearch}
                            minPrice={draftMinPrice}
                            maxPrice={draftMaxPrice}
                            maxAvailablePrice={maxAvailablePrice}
                            onSearchChange={setDraftSearch}
                            onBrandChange={(value) => updateParam("brandId", value)}
                            onCategoryChange={(value) => updateParam("categoryId", value)}
                            onMinPriceChange={setDraftMinPrice}
                            onMaxPriceChange={setDraftMaxPrice}
                            onApply={applyFilters}
                            onPriceRangeSelect={applyPriceRange}
                            onClear={clearFilters}
                        />
                    </div>

                    <section className="space-y-4">
                        {cmsLoading ? (
                            <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
                                \u0110ang t\u1ea3i n\u1ed9i dung n\u1ed5i b\u1eadt...
                            </div>
                        ) : (
                            <PublicCmsSections collection={cmsCollection} />
                        )}

                        <ProductSortBar
                            totalItems={totalItems}
                            sortBy={sortBy}
                            onSortChange={(value) => updateParam("sortBy", value)}
                        />

                        {loading ? (
                            <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
                                \u0110ang t\u1ea3i s\u1ea3n ph\u1ea9m...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-md border bg-white p-8 text-center">
                                <h2 className="font-semibold">
                                    Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    H\u00e3y th\u1eed thay \u0111\u1ed5i t\u1eeb kh\u00f3a ho\u1eb7c b\u1ecf b\u1edbt b\u1ed9 l\u1ecdc.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="mt-4 cursor-pointer"
                                >
                                    X\u00f3a b\u1ed9 l\u1ecdc
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.product_id + "-" + product.variant.variant_id}
                                        product={product}
                                        isWishlisted={Boolean(wishlistMap[product.variant.variant_id])}
                                        onWishlistChange={(variantId, isWishlisted) => {
                                            setWishlistMap((current) => ({
                                                ...current,
                                                [variantId]: isWishlisted,
                                            }));
                                        }}
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
                                className="cursor-pointer"
                            >
                                Tr\u01b0\u1edbc
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                Trang {page} / {Math.max(totalPages, 1)}
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={page >= totalPages}
                                onClick={() => updateParam("page", String(page + 1))}
                                className="cursor-pointer"
                            >
                                Sau
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
`;
fs.writeFileSync(path, content, 'utf8');
