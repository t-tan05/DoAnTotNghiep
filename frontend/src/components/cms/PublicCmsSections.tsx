import FeaturedProductSection from "@/components/home/FeaturedProductSection";
import type { CmsCollection, CmsSection, CmsSectionItem } from "@/types/cms.type";
import type { PublicProductAttribute, PublicProductCardItem } from "@/types/product.type";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
    collection?: CmsCollection | null;
    afterBanner?: ReactNode;
    productPageSize?: number;
};

type CmsPromotion = NonNullable<
    NonNullable<
        NonNullable<CmsSectionItem["product_variants"]>["products"]
    >["products_promotions"]
>[number]["promotions"];

function chunkItems<T>(items: T[], size: number) {
    const chunks: T[][] = [];

    for(let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

function getVariantImage(item: CmsSectionItem) {
    const variant = item.product_variants;

    return (
        item.image_url ||
        variant?.image_url ||
        variant?.product_images?.find((image) => image.is_default)?.image_url ||
        variant?.product_images?.[0]?.image_url ||
        ""
    );
}

function mapAttributes(item: CmsSectionItem): PublicProductAttribute[] {
    return (item.product_variants?.variant_attribute_values ?? []).map((variantAttributeValue) => {
        const attributeValue = variantAttributeValue.attribute_values;
        const attribute = attributeValue.product_attributes;

        return {
            attribute_id: attribute.attribute_id,
            attribute_name: attribute.attribute_name,
            attribute_value_id: attributeValue.attribute_value_id,
            value: attributeValue.value,
        };
    });
}

function calculatePromotionPrice(price: number, promotion: CmsPromotion) {
    if(!promotion) return price;

    if(promotion.discount_type === "PERCENT") {
        return Math.max(0, price - (price * Number(promotion.discount_value)) / 100);
    }

    return Math.max(0, price - Number(promotion.discount_value));
}

function getBestPromotionPrice(item: CmsSectionItem) {
    const variant = item.product_variants;
    const originalPrice = Number(variant?.price ?? 0);
    const now = Date.now();
    let bestPromotion: CmsPromotion | null = null;
    let bestPrice = originalPrice;

    for(const productPromotion of variant?.products?.products_promotions ?? []) {
        const promotion = productPromotion.promotions;

        if(!promotion) continue;
        if(promotion.is_active === false) continue;
        if(new Date(promotion.start_date).getTime() > now) continue;
        if(new Date(promotion.end_date).getTime() < now) continue;

        const nextPrice = calculatePromotionPrice(originalPrice, promotion);

        if(nextPrice < bestPrice) {
            bestPrice = nextPrice;
            bestPromotion = promotion;
        }
    }

    return {
        discountPrice: bestPromotion ? bestPrice : null,
        activePromotion: bestPromotion
            ? {
                promotion_id: bestPromotion.promotion_id,
                promotion_name: bestPromotion.promotion_name,
                discount_type: bestPromotion.discount_type,
                discount_value: bestPromotion.discount_value,
            }
            : null,
    };
}

export function mapCmsItemToProduct(item: CmsSectionItem): PublicProductCardItem | null {
    const variant = item.product_variants;
    const product = variant?.products ?? item.products;

    if(!variant || !product) return null;

    const brand = product.brands;
    const category = product.categories;

    if(!brand || !category) return null;

    const promotionPrice = getBestPromotionPrice(item);

    return {
        product_id: product.product_id,
        product_name: product.product_name,
        brand: {
            brand_id: brand.brand_id,
            brand_name: brand.brand_name,
        },
        category: {
            category_id: category.category_id,
            category_name: category.category_name,
        },
        variant: {
            variant_id: variant.variant_id,
            sku: variant.sku,
            variant_name: item.title || variant.variant_name || product.product_name,
            price: variant.price ?? 0,
            original_price: variant.original_price ?? variant.price ?? 0,
            discount_price: variant.discount_price ?? promotionPrice.discountPrice,
            quantity_in_stock: variant.quantity_in_stock ?? 0,
            image_url: getVariantImage(item),
            attributes: mapAttributes(item),
            active_promotion: promotionPrice.activePromotion,
        },
    };
}

function BannerSection({ section }: { section: CmsSection }) {
    const imageUrl = section.background_image || section.cms_section_items?.[0]?.image_url;
    const href = section.href || section.cms_section_items?.[0]?.href;

    if(!imageUrl) return null;

    const image = (
        <img
            src={imageUrl}
            alt={section.title}
            className="h-full w-full rounded-md object-cover"
        />
    );

    return href ? (
        <Link to={href} className="block overflow-hidden rounded-md">
            {image}
        </Link>
    ) : (
        <div className="overflow-hidden rounded-md">{image}</div>
    );
}

function ShortcutButtonsSection({ section }: { section: CmsSection }) {
    const items = section.cms_section_items ?? [];

    if(!items.length) return null;

    return (
        <section className="rounded-md bg-white p-4">
            <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <Link
                        key={item.item_id}
                        to={item.href || "#"}
                        className="rounded-md border px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:text-blue-700"
                    >
                        {item.title}
                    </Link>
                ))}
            </div>
        </section>
    );
}

function ShortcutCardsSection({ section }: { section: CmsSection }) {
    const items = (section.cms_section_items ?? [])
        .filter((item) => item.is_active)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const pageSize = 5;
    const pages = useMemo(() => chunkItems(items, pageSize), [items]);
    const [page, setPage] = useState(0);
    const totalPages = pages.length;
    const canSlide = items.length > pageSize;
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
    const isFirstPage = currentPage <= 0;
    const isLastPage = currentPage >= totalPages - 1;

    if(!items.length) return null;

    function goPrevious() {
        if(isFirstPage) return;
        setPage(currentPage - 1);
    }

    function goNext() {
        if(isLastPage) return;
        setPage(currentPage + 1);
    }

    return (
        <section className="group/shortcut rounded-md bg-white p-4">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">{section.title}</h2>

                {canSlide ? (
                    <div className="hidden">
                        <button
                            type="button"
                            onClick={goPrevious}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white text-slate-700 transition hover:border-blue-700 hover:text-blue-700"
                            aria-label="Xem thẻ danh mục trước"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white text-slate-700 transition hover:border-blue-700 hover:text-blue-700"
                            aria-label="Xem thẻ danh mục tiếp theo"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="relative">
                {canSlide ? (
                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={isFirstPage}
                        className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/shortcut:opacity-100 group-hover/shortcut:disabled:opacity-35"
                        aria-label="Xem thẻ danh mục trước"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                ) : null}

                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentPage * 100}%)` }}
                    >
                    {pages.map((itemsPage, pageIndex) => (
                        <div
                            key={`shortcut-card-page-${pageIndex}`}
                            className="grid min-w-full grid-cols-5 gap-3"
                        >
                            {itemsPage.map((item) => {
                                if(!item.image_url) {
                                    return item.href ? (
                                        <Link
                                            key={item.item_id}
                                            to={item.href}
                                            className="flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-center text-sm font-medium transition hover:border-blue-700 hover:text-blue-700"
                                        >
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <div
                                            key={item.item_id}
                                            className="flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-center text-sm font-medium"
                                        >
                                            {item.title}
                                        </div>
                                    );
                                }

                                const content = (
                                    <>
                                        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-[#f5f6fb]">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title || section.title}
                                                    className="h-full w-full object-contain p-2 transition duration-300 group-hover/card:scale-105"
                                                />
                                            ) : (
                                                <span className="px-3 text-center text-sm text-muted-foreground">
                                                    {item.title}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 text-center text-sm font-semibold text-slate-900">
                                            {item.title}
                                        </div>
                                        {item.subtitle ? (
                                            <div className="mt-1 line-clamp-2 text-center text-xs text-muted-foreground">
                                                {item.subtitle}
                                            </div>
                                        ) : null}
                                    </>
                                );

                                return item.href ? (
                                    <Link
                                        key={item.item_id}
                                        to={item.href}
                                        className="group/card rounded-md border bg-white p-3 transition hover:border-blue-700 hover:shadow-sm"
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <div
                                        key={item.item_id}
                                        className="rounded-md border bg-white p-3"
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    </div>
                </div>

                {canSlide ? (
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={isLastPage}
                        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-1/3 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/shortcut:opacity-100 group-hover/shortcut:disabled:opacity-35"
                        aria-label="Xem thẻ danh mục tiếp theo"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                ) : null}
            </div>
        </section>
    );
}

export default function PublicCmsSections({ collection, afterBanner, productPageSize }: Props) {
    const sections = (collection?.cms_sections ?? [])
        .filter((section) => section.is_active)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

    if(!collection || !sections.length) {
        return afterBanner ? (
            <div className="space-y-5">
                {afterBanner}
            </div>
        ) : null;
    }

    return (
        <div className="space-y-5">
            {afterBanner}

            {sections.map((section) => {
                if(section.section_type === "BANNER") {
                    return <BannerSection key={section.section_id} section={section} />;
                }

                if(section.section_type === "SHORTCUT_BUTTONS") {
                    return <ShortcutButtonsSection key={section.section_id} section={section} />;
                }

                if(section.section_type === "SHORTCUT_CARDS") {
                    return <ShortcutCardsSection key={section.section_id} section={section} />;
                }

                if(section.section_type === "FEATURED_PRODUCTS") {
                    const products = (section.cms_section_items ?? [])
                        .filter((item) => item.is_active)
                        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
                        .map(mapCmsItemToProduct)
                        .filter((product): product is PublicProductCardItem => Boolean(product));

                    return (
                        <FeaturedProductSection
                            key={section.section_id}
                            title={section.title}
                            href={section.href?.trim() || undefined}
                            products={products}
                            pageSize={productPageSize}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}
