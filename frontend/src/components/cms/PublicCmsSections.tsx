import FeaturedProductSection from "@/components/home/FeaturedProductSection";
import type { CmsCollection, CmsSection, CmsSectionItem } from "@/types/cms.type";
import type { PublicProductAttribute, PublicProductCardItem } from "@/types/product.type";
import { Link } from "react-router-dom";

type Props = {
    collection?: CmsCollection | null;
};

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

export function mapCmsItemToProduct(item: CmsSectionItem): PublicProductCardItem | null {
    const variant = item.product_variants;
    const product = variant?.products ?? item.products;

    if(!variant || !product) return null;

    const brand = product.brands;
    const category = product.categories;

    if(!brand || !category) return null;

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
            discount_price: variant.discount_price,
            quantity_in_stock: variant.quantity_in_stock ?? 0,
            image_url: getVariantImage(item),
            attributes: mapAttributes(item),
        },
    };
}

function getSectionHref(section: CmsSection, collection: CmsCollection) {
    return section.href || `/products?cms=${encodeURIComponent(collection.slug.replace(/^\/+/, ""))}`;
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

export default function PublicCmsSections({ collection }: Props) {
    const sections = (collection?.cms_sections ?? [])
        .filter((section) => section.is_active)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

    if(!collection || !sections.length) return null;

    return (
        <div className="space-y-5">
            {sections.map((section) => {
                if(section.section_type === "BANNER") {
                    return <BannerSection key={section.section_id} section={section} />;
                }

                if(section.section_type === "SHORTCUT_BUTTONS" || section.section_type === "SHORTCUT_CARDS") {
                    return <ShortcutButtonsSection key={section.section_id} section={section} />;
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
                            href={getSectionHref(section, collection)}
                            products={products}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}
