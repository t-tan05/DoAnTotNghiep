import type { ListMeta, ListQuery } from "./admin-table.type";
import type { PublicProductCardItem, PublicProductFilterOption } from "./product.type";

export type CmsPageType = "HOME" | "CATEGORY" | "BRAND" | "CAMPAIGN" | "CUSTOM";

export type CmsSectionType =
    | "BANNER"
    | "SHORTCUT_BUTTONS"
    | "SHORTCUT_CARDS"
    | "FEATURED_PRODUCTS"
    | "BLOG_GRID"
    | "PRODUCT_GRID";

export type CmsRuleSortBy =
    | "NEWEST"
    | "PRICE_ASC"
    | "PRICE_DESC"
    | "BEST_SELLING"
    | "PROMOTION";

export type CmsCollectionSortBy = "created_at" | "title" | "sort_order";

export type CmsCollection = {
    collection_id: string;
    slug: string;
    title: string;
    description?: string | null;
    page_type: CmsPageType;
    category_id?: string | null;
    brand_id?: string | null;
    is_active: boolean;
    sort_order: number;
    metadata?: unknown;
    created_at?: string;
    updated_at?: string;

    categories?: {
        category_id: string;
        category_name: string;
    } | null;

    brands?: {
        brand_id: string;
        brand_name: string;
    } | null;

    cms_sections?: CmsSection[];
    cms_collection_rules?: CmsCollectionRule[];
    _count?: {
        cms_sections: number;
        cms_collection_rules: number;
    };
};

export type CmsSection = {
    section_id: string;
    collection_id: string;
    title: string;
    section_type: CmsSectionType;
    subtitle?: string | null;
    href?: string | null;
    background_image?: string | null;
    is_active: boolean;
    sort_order: number;
    metadata?: unknown;
    cms_section_items?: CmsSectionItem[];
};

export type CmsSectionItem = {
    item_id: string;
    section_id: string;
    title?: string | null;
    subtitle?: string | null;
    image_url?: string | null;
    href?: string | null;
    product_id?: string | null;
    variant_id?: string | null;
    blog_id?: string | null;
    is_active: boolean;
    sort_order: number;
    metadata?: unknown;
    products?: {
        product_id: string;
        product_name: string;
        brands?: {
            brand_id: string;
            brand_name: string;
        };
        categories?: {
            category_id: string;
            category_name: string;
        };
    } | null;
    product_variants?: {
        variant_id: string;
        variant_name?: string | null;
        sku: string;
        price?: number | string;
        original_price?: number | string | null;
        discount_price?: number | string | null;
        quantity_in_stock?: number;
        image_url?: string | null;
        product_images?: Array<{
            image_id: number | string;
            image_url: string;
            is_default?: boolean | null;
        }>;
        products?: {
            product_id: string;
            product_name: string;
            brands: {
                brand_id: string;
                brand_name: string;
            };
            categories: {
                category_id: string;
                category_name: string;
            };
        };
        variant_attribute_values?: Array<{
            attribute_values: {
                attribute_value_id: string;
                value: string;
                product_attributes: {
                    attribute_id: string;
                    attribute_name: string;
                };
            };
        }>;
    } | null;
    blog_posts?: {
        post_id: string;
        title: string;
    } | null;
};

export type CmsCollectionRule = {
    rule_id: string;
    collection_id: string;
    category_id?: string | null;
    brand_id?: string | null;
    attribute_name?: string | null;
    attribute_value?: string | null;
    keyword?: string | null;
    min_price?: string | number | null;
    max_price?: string | number | null;
    sort_by: CmsRuleSortBy;
    limit: number;
    is_active: boolean;
    metadata?: unknown;
    categories?: {
        category_id: string;
        category_name: string;
    } | null;
    brands?: {
        brand_id: string;
        brand_name: string;
    } | null;
};

export type CmsCollectionListQuery = ListQuery<CmsCollectionSortBy> & {
    pageType?: CmsPageType;
    isActive?: boolean;
};

export type CmsCollectionListData = {
    collections: CmsCollection[];
    meta: ListMeta<CmsCollectionSortBy>;
};

export type CmsCollectionPayload = {
    slug: string;
    title: string;
    description?: string | null;
    pageType: CmsPageType;
    categoryId?: string | null;
    brandId?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    metadata?: unknown;
};

export type CmsSectionPayload = {
    title: string;
    sectionType: CmsSectionType;
    subtitle?: string | null;
    href?: string | null;
    backgroundImage?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    metadata?: unknown;
};

export type CmsSectionItemPayload = {
    title?: string | null;
    subtitle?: string | null;
    imageUrl?: string | null;
    href?: string | null;
    productId?: string | null;
    variantId?: string | null;
    blogId?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    metadata?: unknown;
};

export type BulkCmsSectionItemsPayload = {
    items: CmsSectionItemPayload[];
};

export type CmsCollectionRulePayload = {
    categoryId?: string | null;
    brandId?: string | null;
    attributeName?: string | null;
    attributeValue?: string | null;
    keyword?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: CmsRuleSortBy;
    limit?: number;
    isActive?: boolean;
    metadata?: unknown;
};

export type CmsCollectionDetailData = {
    collection: CmsCollection;
};

export type PublicCmsCollectionData = CmsCollection;

export type PublicCmsCollectionProductsData = {
    items: PublicProductCardItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type PublicCmsCollectionFiltersData = {
    brands: PublicProductFilterOption[];
    categories: PublicProductFilterOption[];
    attributes: Array<{
        attribute_id: string;
        attribute_name: string;
        values: Array<{
            attribute_value_id: string;
            value: string;
        }>;
    }>;
    maxPrice: number;
};

export type PublicCmsCollectionSuggestion = {
    collection_id: string;
    title: string;
    slug: string;
    page_type: CmsPageType;
};

export type PublicCmsCollectionSuggestionsData = {
    collections: PublicCmsCollectionSuggestion[];
};
