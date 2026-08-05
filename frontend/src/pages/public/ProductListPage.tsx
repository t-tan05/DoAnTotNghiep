import PublicCmsSections, { mapCmsItemToProduct } from "@/components/cms/PublicCmsSections";
import ProductCard from "@/components/prod/ProductCard";
import ProductFilterSidebar from "@/components/prod/ProductFilterSidebar";
import ProductSortButtons from "@/components/prod/ProductSortButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { cmsService } from "@/services/cms.service";
import { wishlistService } from "@/services/wishlist.service";
import type { CmsCollection } from "@/types/cms.type";
import { isStaffUser } from "@/utils/authRole";
import type {
    PublicProductCardItem,
    PublicProductFilterOption,
} from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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

    if(trimmed.startsWith("/c/")) {
        return slugify(trimmed.replace(/^\/c\//, ""));
    }

    return slugify(trimmed.replace(/^\/+/, ""));
}

function getCmsProductGridProducts(collection: CmsCollection | null) {
    const products = (collection?.cms_sections ?? [])
        .filter((section) => section.is_active && section.section_type === "PRODUCT_GRID")
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .flatMap((section) =>
            (section.cms_section_items ?? [])
                .filter((item) => item.is_active)
                .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        )
        .map(mapCmsItemToProduct)
        .filter((product): product is PublicProductCardItem => Boolean(product));

    return groupCmsProductsByProductId(products);
}

function getProductRepresentativePrice(product: PublicProductCardItem) {
    return Number(product.variant.discount_price ?? product.variant.price ?? 0);
}

function groupCmsProductsByProductId(products: PublicProductCardItem[]) {
    const groups = new Map<string, PublicProductCardItem[]>();

    for(const product of products) {
        if(!groups.has(product.product_id)) {
            groups.set(product.product_id, []);
        }

        groups.get(product.product_id)!.push(product);
    }

    return Array.from(groups.values()).map((groupProducts) => {
        const representativeProduct = [...groupProducts].sort(
            (a, b) => getProductRepresentativePrice(a) - getProductRepresentativePrice(b),
        )[0];

        return {
            ...representativeProduct,
            variant_count: groupProducts.length,
            color_options: groupProducts.map((product) => ({
                variant_id: product.variant.variant_id,
                image_url: product.variant.image_url,
                color: product.variant.attributes.find((attribute) => {
                    const attributeName = attribute.attribute_name.toLowerCase();
                    return attributeName.includes("màu")
                        || attributeName.includes("mau")
                        || attributeName.includes("color");
                })?.value ?? null,
            })),
        };
    });
}

function getUniqueFilterOptions(
    products: PublicProductCardItem[],
    key: "brand" | "category",
): PublicProductFilterOption[] {
    const map = new Map<string, PublicProductFilterOption>();

    for(const product of products) {
        if(key === "brand") {
            map.set(product.brand.brand_id, {
                id: product.brand.brand_id,
                name: product.brand.brand_name,
            });
        }else {
            map.set(product.category.category_id, {
                id: product.category.category_id,
                name: product.category.category_name,
            });
        }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function getProductPrice(product: PublicProductCardItem) {
    return Number(product.variant.discount_price ?? product.variant.price ?? 0);
}

function getProductDiscountValue(product: PublicProductCardItem) {
    const originalPrice = Number(product.variant.original_price ?? product.variant.price ?? 0);
    const currentPrice = Number(product.variant.discount_price ?? product.variant.price ?? 0);

    return Math.max(0, originalPrice - currentPrice);
}

function clampFilterPrice(value: string, maxAvailablePrice: number) {
    const maxPriceLimit = Math.max(Number(maxAvailablePrice || 0), 0);
    const numericValue = Number(value);

    if(!value || Number.isNaN(numericValue) || maxPriceLimit <= 0) return "";

    return String(Math.min(Math.max(numericValue, 0), maxPriceLimit));
}

function filterCmsGridProducts(
    products: PublicProductCardItem[],
    filters: {
        search: string;
        brandId: string;
        categoryId: string;
        minPrice: string;
        maxPrice: string;
        sortBy: string;
    },
) {
    const searchValue = filters.search.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
        const price = getProductPrice(product);

        if(filters.brandId && product.brand.brand_id !== filters.brandId) return false;
        if(filters.categoryId && product.category.category_id !== filters.categoryId) return false;
        if(filters.minPrice && price < Number(filters.minPrice)) return false;
        if(filters.maxPrice && price > Number(filters.maxPrice)) return false;

        if(searchValue) {
            const haystack = [
                product.product_name,
                product.variant.variant_name,
                product.variant.sku,
                product.brand.brand_name,
                product.category.category_name,
            ].join(" ").toLowerCase();

            if(!haystack.includes(searchValue)) return false;
        }

        return true;
    });

    if(filters.sortBy === "price_asc") {
        return [...filteredProducts].sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }

    if(filters.sortBy === "price_desc") {
        return [...filteredProducts].sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    if(filters.sortBy === "name_asc") {
        return [...filteredProducts].sort((a, b) =>
            String(a.variant.variant_name || a.product_name)
                .localeCompare(String(b.variant.variant_name || b.product_name), "vi")
        );
    }

    if(filters.sortBy === "promotion") {
        return [...filteredProducts].sort((a, b) => getProductDiscountValue(b) - getProductDiscountValue(a));
    }

    return filteredProducts;
}

function getCmsBreadcrumbs(
    collection: CmsCollection | null,
    categories: PublicProductFilterOption[],
    brands: PublicProductFilterOption[],
) {
    const items = [{ label: "Trang chủ", href: "/" }];
    const currentSlug = collection?.slug ? slugify(collection.slug) : "";
    const currentTitle = collection?.title || "Sản phẩm";

    function pushParent(label: string, href: string) {
        const parentSlug = normalizeCmsSlug(href);

        if(parentSlug && parentSlug === currentSlug) return;
        if(items.some((item) => item.href === href || item.label === label)) return;

        items.push({ label, href });
    }

    function pushCurrent() {
        items.push({
            label: currentTitle,
            href: "",
        });
    }

    const laptopBrands = [
        { slug: "hp", label: "HP" },
        { slug: "lenovo", label: "Lenovo" },
        { slug: "msi", label: "MSI" },
        { slug: "asus", label: "ASUS" },
        { slug: "acer", label: "Acer" },
    ];

    if(currentSlug.includes("chuot")) {
        pushParent("Phụ kiện máy tính", "/c/phu-kien-may-tinh");
        pushParent("Chuột máy tính", "/c/chuot-may-tinh");
        pushCurrent();
        return items;
    }

    if(currentSlug.includes("ban-phim")) {
        pushParent("Phụ kiện máy tính", "/c/phu-kien-may-tinh");

        if(currentSlug !== "ban-phim-may-tinh") {
            pushParent("Bàn phím", "/c/ban-phim");
        }

        pushCurrent();
        return items;
    }

    if(currentSlug.includes("tai-nghe")) {
        pushParent("Thiết bị âm thanh", "/c/thiet-bi-am-thanh");
        pushParent("Tai nghe", "/c/tai-nghe");
        pushCurrent();
        return items;
    }

    if(currentSlug.includes("loa")) {
        pushParent("Thiết bị âm thanh", "/c/thiet-bi-am-thanh");
        pushParent("Loa nghe nhạc", "/c/loa-nghe-nhac");
        pushCurrent();
        return items;
    }

    if(currentSlug.includes("ghe-gaming")) {
        pushParent("Gaming Gear", "/c/gaming-gear");
        pushCurrent();
        return items;
    }

    if(currentSlug.startsWith("laptop-")) {
        pushParent("Laptop", "/c/laptop");

        const laptopBrand = laptopBrands.find((brand) =>
            currentSlug === `laptop-${brand.slug}` || currentSlug.startsWith(`laptop-${brand.slug}-`)
        );

        if(laptopBrand && currentSlug !== `laptop-${laptopBrand.slug}`) {
            pushParent(laptopBrand.label, `/c/laptop-${laptopBrand.slug}`);
        }

        pushCurrent();
        return items;
    }

    const category = collection?.categories
        ? {
            id: collection.categories.category_id,
            name: collection.categories.category_name,
        }
        : categories.length === 1 ? categories[0] : null;

    const brand = collection?.brands
        ? {
            id: collection.brands.brand_id,
            name: collection.brands.brand_name,
        }
        : brands.length === 1 ? brands[0] : null;

    if(category) {
        pushParent(category.name, `/c/${slugify(category.name)}`);
    }

    if(brand && !currentSlug.includes(slugify(brand.name))) {
        pushParent(brand.name, `/c/${slugify(brand.name)}`);
    }

    pushCurrent();

    return items;
}

export default function ProductListPage() {
    const { cmsSlug: routeCmsSlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const canUseWishlist = isAuthenticated && !isStaffUser(user);

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

    const [draftSearch, setDraftSearch] = useState(search);
    const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
    const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

    const [maxAvailablePrice, setMaxAvailablePrice] = useState(0);
    const [cmsCollection, setCmsCollection] = useState<CmsCollection | null>(null);
    const [cmsLoading, setCmsLoading] = useState(false);
    const [cmsNotFound, setCmsNotFound] = useState(false);

    const cmsSlug = normalizeCmsSlug(routeCmsSlug || "");
    const isCmsPage = Boolean(cmsSlug);

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
        const next = new URLSearchParams();

        setSearchParams(next);
    }

    function applyFilters() {
        const next = new URLSearchParams(searchParams);
        const nextMinPrice = clampFilterPrice(draftMinPrice, maxAvailablePrice);
        const nextMaxPrice = clampFilterPrice(draftMaxPrice, maxAvailablePrice);

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

    function applyPriceRange(nextMinPrice: string, nextMaxPrice: string) {
        const next = new URLSearchParams(searchParams);
        const safeMinPrice = clampFilterPrice(nextMinPrice, maxAvailablePrice);
        const safeMaxPrice = clampFilterPrice(nextMaxPrice, maxAvailablePrice);

        if(draftSearch.trim()) {
            next.set("search", draftSearch.trim());
        }else {
            next.delete("search");
        }

        if(safeMinPrice) {
            next.set("minPrice", safeMinPrice);
        }else {
            next.delete("minPrice");
        }

        if(safeMaxPrice) {
            next.set("maxPrice", safeMaxPrice);
        }else {
            next.delete("maxPrice");
        }

        next.set("page", "1");
        setDraftMinPrice(safeMinPrice);
        setDraftMaxPrice(safeMaxPrice);
        setSearchParams(next);
    }

    async function loadCmsCollection() {
        if(!cmsSlug) {
            setCmsCollection(null);
            setCmsNotFound(true);
            return;
        }

        try {
            setCmsLoading(true);
            setCmsNotFound(false);
            const data = await cmsService.getPublicCollection(cmsSlug);
            setCmsCollection(data);
        }catch{
            setCmsCollection(null);
            setCmsNotFound(true);
        }finally{
            setCmsLoading(false);
        }
    }

    async function loadProducts() {
        try {
            setLoading(true);

            if(!isCmsPage || cmsLoading || cmsNotFound || !cmsCollection) {
                setProducts([]);
                setBrands([]);
                setCategories([]);
                setTotalItems(0);
                setTotalPages(1);
                setWishlistMap({});
                return;
            }

            if(isCmsPage) {
                const cmsGridProducts = getCmsProductGridProducts(cmsCollection);

                if(cmsGridProducts.length > 0) {
                    const filteredProducts = filterCmsGridProducts(cmsGridProducts, {
                        search,
                        brandId,
                        categoryId,
                        minPrice,
                        maxPrice,
                        sortBy,
                    });
                    const totalGridItems = filteredProducts.length;
                    const start = (page - 1) * 20;
                    const paginatedProducts = filteredProducts.slice(start, start + 20);
                    const maxGridPrice = cmsGridProducts.reduce(
                        (maxPrice, product) => Math.max(maxPrice, getProductPrice(product)),
                        0,
                    );

                    setMaxAvailablePrice(maxGridPrice);

                    if(!searchParams.has("minPrice")) {
                        setDraftMinPrice("0");
                    }

                    if(!searchParams.has("maxPrice")) {
                        setDraftMaxPrice(String(maxGridPrice));
                    }

                    setProducts(paginatedProducts);
                    setBrands(getUniqueFilterOptions(cmsGridProducts, "brand"));
                    setCategories(getUniqueFilterOptions(cmsGridProducts, "category"));
                    setTotalItems(totalGridItems);
                    setTotalPages(Math.ceil(totalGridItems / 20));

                    if(canUseWishlist && paginatedProducts.length > 0) {
                        try {
                            const variantIds = paginatedProducts.map((product) => product.variant.variant_id);
                            const wishlistData = await wishlistService.checkMany(variantIds);

                            setWishlistMap(wishlistData?.items ?? {});
                        } catch {
                            setWishlistMap({});
                        }
                    }else {
                        setWishlistMap({});
                    }

                    return;
                }

                const [productData, filterData] = await Promise.all([
                    cmsService.getPublicCollectionProducts(cmsSlug, {
                        page,
                        limit: 20,
                        search: search || undefined,
                        brandId: brandId || undefined,
                        categoryId: categoryId || undefined,
                        minPrice: minPrice ? Number(minPrice) : undefined,
                        maxPrice: maxPrice ? Number(maxPrice) : undefined,
                        sortBy,
                    }),
                    cmsService.getPublicCollectionFilters(cmsSlug),
                ]);

                setMaxAvailablePrice(Number(filterData.maxPrice ?? 0));

                if(!searchParams.has("minPrice")) {
                    setDraftMinPrice("0");
                }

                if(!searchParams.has("maxPrice")) {
                    setDraftMaxPrice(String(Number(filterData.maxPrice ?? 0)));
                }

                setProducts(productData.items);
                setBrands(filterData.brands);
                setCategories(filterData.categories);
                setTotalItems(productData.total);
                setTotalPages(productData.totalPages);

                if(canUseWishlist && productData.items.length > 0) {
                    try {
                        const variantIds = productData.items.map((product) => product.variant.variant_id);
                        const wishlistData = await wishlistService.checkMany(variantIds);

                        setWishlistMap(wishlistData?.items ?? {});
                    } catch {
                        setWishlistMap({});
                    }
                }else {
                    setWishlistMap({});
                }

                return;
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
    }, [searchParams, isAuthenticated, cmsSlug, isCmsPage, cmsCollection, cmsLoading, cmsNotFound]);

    useEffect(() => {
        loadCmsCollection();
    }, [cmsSlug]);

    const breadcrumbs = isCmsPage
        ? getCmsBreadcrumbs(cmsCollection, categories, brands)
        : [];

    return (
        <main className="bg-[#f5f6fb] py-6">
            <div className="mx-auto max-w-7xl px-4">
                {breadcrumbs.length > 0 ? (
                    <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;

                            return (
                                <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                                    {isLast || !item.href ? (
                                        <span className="font-medium text-foreground text-lg">{item.label}</span>
                                    ) : (
                                        <Link to={item.href} className="text-sky-500 text-lg transition hover:text-foreground">
                                            {item.label}
                                        </Link>
                                    )}
                                    {!isLast ? (
                                        <span className="text-muted-foreground">›</span>
                                    ) : null}
                                </span>
                            );
                        })}
                    </nav>
                ) : null}

                <div className="hidden">
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
                                Đang tải nội dung nổi bật...
                            </div>
                        ) : cmsNotFound ? (
                            <div className="rounded-md border bg-white p-8 text-center">
                                <h1 className="text-xl font-semibold">Không tìm thấy CMS collection</h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Vui lòng tạo và bật collection có slug /c/{cmsSlug} trong CMS.
                                </p>
                            </div>
                        ) : (
                            <PublicCmsSections
                                collection={cmsCollection}
                                afterBanner={(
                                    <section className="rounded-md bg-white p-5">
                                        <h1 className="text-2xl font-semibold text-[#2d3b55]">
                                            {cmsCollection?.title || "Sản phẩm"}{" "}
                                            <span className="font-normal text-[#8490ad]">
                                                ({totalItems} sản phẩm)
                                            </span>
                                        </h1>
                                        {cmsCollection?.description ? (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {cmsCollection.description}
                                            </p>
                                        ) : !isCmsPage ? (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Tìm kiếm và lựa chọn sản phẩm phù hợp với nhu cầu của bạn.
                                            </p>
                                        ) : null}
                                    </section>
                                )}
                            />
                        )}

                        <ProductSortButtons
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
