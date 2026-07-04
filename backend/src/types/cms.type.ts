export type PublicCmsProductQuery = {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "newest" | "price_asc" | "price_desc" | "best_selling" | "promotion";
    attributeValueIds?: string[];
};

export type CmsFilterAttributeOption = {
    attribute_id: string;
    attribute_name: string;
    values: {
        attribute_value_id: string;
        value: string;
    }[];
};

export type CreateCmsCollectionPayload = {
    slug: string;
    title: string;
    description?: string | null;
    pageType: "HOME" | "CATEGORY" | "BRAND" | "CAMPAIGN" | "CUSTOM";
    categoryId?: string | null;
    brandId?: string | null;
    metadata?: any;
    sortOrder?: number;
    isActive?: boolean;
};

export type UpdateCmsCollectionPayload = Partial<CreateCmsCollectionPayload>;

export type CreateCmsSectionPayload = {
    sectionType: "BANNER" | "SHORTCUT_BUTTONS" | "SHORTCUT_CARDS" | "FEATURED_PRODUCTS" | "BLOG_GRID" | "PRODUCT_GRID";
    title?: string | null;
    subtitle?: string | null;
    backgroundImage?: string | null;
    href?: string | null;
    metadata?: any;
    sortOrder?: number;
    isActive?: boolean;
};

export type AdminCmsCollectionQuery = {
    page?: number;
    limit?: number;
    search?: string;
    pageType?: "HOME" | "CATEGORY" | "BRAND" | "CAMPAIGN" | "CUSTOM";
    isActive?: boolean;
    sortBy?: "created_at" | "title" | "sort_order";
    sortOrder?: "asc" | "desc";
};

export type UpdateCmsSectionPayload = Partial<CreateCmsSectionPayload>;

export type CreateCmsSectionItemPayload = {
    title?: string | null;
    subtitle?: string | null;
    imageUrl?: string | null;
    href?: string | null;
    productId?: string | null;
    variantId?: string | null;
    blogId?: string | null;
    metadata?: any;
    sortOrder?: number;
    isActive?: boolean;
};

export type UpdateCmsSectionItemPayload = Partial<CreateCmsSectionItemPayload>;

export type BulkCreateCmsSectionItemsPayload = {
    items: CreateCmsSectionItemPayload[];
};

export type CreateCmsRulePayload = {
    categoryId?: string | null;
    brandId?: string | null;
    attributeName?: string | null;
    attributeValue?: string | null;
    keyword?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "BEST_SELLING" | "PROMOTION";
    limit?: number;
    metadata?: any;
    isActive?: boolean;
};

export type UpdateCmsRulePayload = Partial<CreateCmsRulePayload>;
