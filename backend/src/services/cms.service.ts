import {
    createCmsCollection,
    createCmsRule,
    createCmsSection,
    createCmsSectionItem,
    deleteCmsCollection,
    deleteCmsRule,
    deleteCmsSection,
    deleteCmsSectionItem,
    findActiveCmsCollectionBySlug,
    findCmsCollectionById,
    findCmsCollectionBySlug,
    findCmsFilterVariants,
    findCmsRuleById,
    findCmsSectionById,
    findCmsSectionItemById,
    findPublicVariantsByCmsCollection,
    getAdminCmsCollections,
    updateCmsCollection,
    updateCmsRule,
    updateCmsSection,
    updateCmsSectionItem,
} from "#models/cms.model"
import {
    CreateCmsCollectionPayload,
    CreateCmsRulePayload,
    CreateCmsSectionItemPayload,
    CreateCmsSectionPayload,
    AdminCmsCollectionQuery,
    PublicCmsProductQuery,
    UpdateCmsCollectionPayload,
    UpdateCmsRulePayload,
    UpdateCmsSectionItemPayload,
    UpdateCmsSectionPayload,
} from "#types/cms.type";
import AppError from "#utils/AppError";
import crypto from "crypto";
import { groupPublicVariants, sortPublicProductCards } from "#services/product.service";

const getMetadataArray = (metadata: unknown, key: string) => {
    if(!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return [];
    }

    const value = (metadata as Record<string, unknown>)[key];

    if(!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => String(item || "").trim())
        .filter(Boolean);
};

const addInFilter = (target: any, field: string, values: string[]) => {
    if(values.length === 1) {
        target[field] = values[0];
        return;
    }

    if(values.length > 1) {
        target[field] = {
            in: values,
        };
    }
};

const buildCmsBaseProductWhere = (collection: any) => {
    const productWhere: any = {};
    const categoryIds = [
        collection.category_id,
        ...getMetadataArray(collection.metadata, "categoryIds"),
    ].filter(Boolean);
    const brandIds = [
        collection.brand_id,
        ...getMetadataArray(collection.metadata, "brandIds"),
    ].filter(Boolean);

    addInFilter(productWhere, "category_id", Array.from(new Set(categoryIds)));
    addInFilter(productWhere, "brand_id", Array.from(new Set(brandIds)));

    return Object.keys(productWhere).length > 0 ? { products: productWhere } : {};
};

const buildCmsRuleWhere = (rule: any) => {
    const where: any = {};
    const productWhere: any = {};
    const categoryIds = [
        rule.category_id,
        ...getMetadataArray(rule.metadata, "categoryIds"),
    ].filter(Boolean);
    const brandIds = [
        rule.brand_id,
        ...getMetadataArray(rule.metadata, "brandIds"),
    ].filter(Boolean);

    addInFilter(productWhere, "category_id", Array.from(new Set(categoryIds)));
    addInFilter(productWhere, "brand_id", Array.from(new Set(brandIds)));

    if(Object.keys(productWhere).length > 0) {
        where.products = productWhere;
    }

    if(rule.keyword) {
        const keyword = String(rule.keyword).trim();

        where.OR = [
            { variant_name: { contains: keyword } },
            { sku: { contains: keyword } },
            { products: { product_name: { contains: keyword } } },
            { products: { brands: { brand_name: { contains: keyword } } } },
            { products: { categories: { category_name: { contains: keyword } } } },
        ];
    }

    if(rule.min_price || rule.max_price) {
        where.price = {};

        if(rule.min_price) {
            where.price.gte = Number(rule.min_price);
        }

        if(rule.max_price) {
            where.price.lte = Number(rule.max_price);
        }
    }

    if(rule.attribute_name || rule.attribute_value) {
        const attributeWhere: any = {};

        if(rule.attribute_value) {
            attributeWhere.value = {
                contains: String(rule.attribute_value).trim(),
            };
        }

        if(rule.attribute_name) {
            attributeWhere.product_attributes = {
                attribute_name: {
                    contains: String(rule.attribute_name).trim(),
                },
            };
        }

        where.variant_attribute_values = {
            some: {
                attribute_values: attributeWhere,
            },
        };
    }

    return where;
};

const buildCmsProductScopeWhere = (collection: any) => {
    const baseWhere = buildCmsBaseProductWhere(collection);
    const ruleWheres = collection.cms_collection_rules
        ?.filter((rule: any) => rule.is_active)
        .map(buildCmsRuleWhere)
        .filter((where: any) => Object.keys(where).length > 0) ?? [];

    if(ruleWheres.length === 0) {
        return baseWhere;
    }

    const andWhere = [];

    if(Object.keys(baseWhere).length > 0) {
        andWhere.push(baseWhere);
    }

    andWhere.push({ OR: ruleWheres });

    return andWhere.length === 1 ? andWhere[0] : { AND: andWhere };
};

const mergeVariantWhere = (...whereList: any[]) => {
    const items = whereList.filter((where) => where && Object.keys(where).length > 0);

    if(items.length === 0) {
        return {};
    }

    return items.length === 1 ? items[0] : { AND: items };
};

const buildCmsQueryFilterWhere = (query: PublicCmsProductQuery) => {
    const where: any = {};
    const productWhere: any = {};

    if(query.categoryId) {
        productWhere.category_id = query.categoryId;
    }

    if(query.brandId) {
        productWhere.brand_id = query.brandId;
    }

    if(Object.keys(productWhere).length > 0) {
        where.products = productWhere;
    }

    if (query.search) {
        where.OR = [
            { variant_name: { contains: query.search } },
            { sku: { contains: query.search } },
            { products: { product_name: { contains: query.search } } },
            { products: { brands: { brand_name: { contains: query.search } } } },
            { products: { categories: { category_name: { contains: query.search } } } },
        ];
    }

    if (query.minPrice || query.maxPrice) {
        where.price = {};

        if (query.minPrice) {
            where.price.gte = Number(query.minPrice);
        }

        if (query.maxPrice) {
            where.price.lte = Number(query.maxPrice);
        }
    }

    if(query.attributeValueIds && query.attributeValueIds.length > 0) {
        where.variant_attribute_values = {
            some: {
                attribute_value_id: {
                    in: query.attributeValueIds,
                },
            },
        };
    }

    return where;
};

export const getPublicCmsCollectionService = async(slug: string) => {
    const collection = await findActiveCmsCollectionBySlug(slug);

    if(!collection) {
        throw new AppError("Không tìm thấy trang CMS.", 404);
    }

    return collection;
}

export const getPublicCmsCollectionProductsService = async(
    slug: string,
    query: PublicCmsProductQuery,
) => {
    const collection = await findActiveCmsCollectionBySlug(slug);

    if(!collection) {
        throw new AppError("Không tìm thấy trang CMS.", 404);
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const where = mergeVariantWhere(
        buildCmsProductScopeWhere(collection),
        buildCmsQueryFilterWhere(query),
    );

    let orderBy: any = { created_at: "desc" };

    if (query.sortBy === "price_asc") {
        orderBy = { price: "asc" };
    }

    if (query.sortBy === "price_desc") {
        orderBy = { price: "desc" };
    }

    if (query.sortBy === "newest") {
        orderBy = { created_at: "desc" };
    }

    if (query.sortBy === "best_selling") {
        orderBy = { sold_quantity: "desc" };
    }

    const { items } = await findPublicVariantsByCmsCollection({
        where,
        skip: 0,
        take: 10000,
        orderBy,
    });
    const groupedProducts = sortPublicProductCards(groupPublicVariants(items), query.sortBy as any);
    const total = groupedProducts.length;
    const paginatedProducts = groupedProducts.slice(skip, skip + limit);

    return {
        items: paginatedProducts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const getPublicCmsCollectionFiltersService = async(slug: string) => {
    const collection = await findActiveCmsCollectionBySlug(slug);

    if(!collection) {
        throw new AppError("Không tìm thấy trang CMS.", 404);
    }

    const where = buildCmsProductScopeWhere(collection);

    const variants = await findCmsFilterVariants(where);

    const brandMap = new Map<string, any>();
    const categoryMap = new Map<string, any>();
    const attributeMap = new Map<string, any>();
    let maxPrice = 0;

    for(const variant of variants) {
        const price = Number(variant.price);

        if(price > maxPrice) {
            maxPrice = price;
        }

        const brand = variant.products.brands;
        const category = variant.products.categories;

        if(brand) {
            brandMap.set(brand.brand_id, {
                id: brand.brand_id,
                name: brand.brand_name,
            });
        }

        if(category) {
            categoryMap.set(category.category_id, {
                id: category.category_id,
                name: category.category_name,
            });
        }

        for(const item of variant.variant_attribute_values) {
            const attributeValue = item.attribute_values;
            const attribute = attributeValue.product_attributes;

            if(!attributeMap.has(attribute.attribute_id)) {
                attributeMap.set(attribute.attribute_id, {
                    attribute_id: attribute.attribute_id,
                    attribute_name: attribute.attribute_name,
                    display_order: attribute.display_order ?? 0,
                    values: new Map<string, any>(),
                });
            }

            attributeMap.get(attribute.attribute_id).values.set(attributeValue.attribute_value_id, {
                attribute_value_id: attributeValue.attribute_value_id,
                value: attributeValue.value,
                display_order: attributeValue.display_order ?? 0,
            });
        }
    }

    const attributes = Array.from(attributeMap.values())
        .sort((a, b) => a.display_order - b.display_order)
        .map((attribute) => ({
            attribute_id: attribute.attribute_id,
            attribute_name: attribute.attribute_name,
            values: Array.from(attribute.values.values())
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((value: any) => ({
                    attribute_value_id: value.attribute_value_id,
                    value: value.value,
                })),
        }));

    return {
        brands: Array.from(brandMap.values()),
        categories: Array.from(categoryMap.values()),
        attributes,
        maxPrice,
    };
};

export const getAdminCmsCollectionsService = async(query: AdminCmsCollectionQuery) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? "created_at";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {};

    if(query.search?.trim()) {
        const search = query.search.trim();

        where.OR = [
            { title: { contains: search } },
            { slug: { contains: search } },
            { description: { contains: search } },
            { categories: { category_name: { contains: search } } },
            { brands: { brand_name: { contains: search } } },
        ];
    }

    if(query.pageType) {
        where.page_type = query.pageType;
    }

    if(query.isActive !== undefined) {
        where.is_active = query.isActive;
    }

    const orderBy = [
        { [sortBy]: sortOrder },
        { created_at: "desc" as const },
    ];

    const { collections, total } = await getAdminCmsCollections({
        where,
        skip,
        take: limit,
        orderBy,
    });

    return {
        collections,
        meta: {
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
            },
            sort: {
                sortBy,
                sortOrder,
            },
            search: query.search,
        },
    };
};

export const getAdminCmsCollectionDetailService = async(collectionId: string) => {
    const collection = await findCmsCollectionById(collectionId);

    if(!collection) {
        throw new AppError("Không tìm thấy CMS collection.", 404);
    }

    return {
        collection,
    };
};

export const createCmsCollectionService = async(data: CreateCmsCollectionPayload) => {
    const existedSlug = await findCmsCollectionBySlug(data.slug);

    if(existedSlug) {
        throw new AppError("Slug CMS đã tồn tại.", 400);
    }

    const collection = await createCmsCollection({
        collection_id: crypto.randomUUID(),
        slug: data.slug,
        title: data.title,
        description: data.description ?? null,
        page_type: data.pageType,
        category_id: data.categoryId ?? null,
        brand_id: data.brandId ?? null,
        metadata: data.metadata ?? undefined,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
    });

    return {
        collection,
    };
};

export const updateCmsCollectionService = async(
    collectionId: string,
    data: UpdateCmsCollectionPayload
) => {
    const collection = await findCmsCollectionById(collectionId);

    if(!collection) {
        throw new AppError("Không tìm thấy CMS collection.", 404);
    }

    if(data.slug && data.slug !== collection.slug) {
        const existedSlug = await findCmsCollectionBySlug(data.slug);

        if(existedSlug) {
            throw new AppError("Slug CMS đã tồn tại.", 409);
        }
    }

    const updateData: any = {};

    if(data.slug !== undefined) updateData.slug = data.slug;

    if(data.title !== undefined) updateData.title = data.title;

    if(data.description !== undefined) updateData.description = data.description;

    if(data.pageType !== undefined) updateData.page_type = data.pageType;

    if(data.categoryId !== undefined) updateData.category_id = data.categoryId;

    if(data.brandId !== undefined) updateData.brand_id = data.brandId;

    if(data.metadata !== undefined) updateData.metadata = data.metadata;

    if(data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    if(data.isActive !== undefined) updateData.is_active = data.isActive;

    const updatedCollection = await updateCmsCollection(collectionId, updateData);

    return { collection: updatedCollection };
};

export const deleteCmsCollectionService = async(collectionId: string) => {
    const collection = await findCmsCollectionById(collectionId);

    if(!collection) {
        throw new AppError("Không tìm thấy CMS collection.", 404);
    }

    const deletedCollection = await deleteCmsCollection(collectionId);

    return { collection: deletedCollection };
};

export const createCmsSectionService = async(
    collectionId: string,
    data: CreateCmsSectionPayload
) => {
    const collection = await findCmsCollectionById(collectionId);

    if(!collection) {
        throw new AppError("Không tìm thấy CMS collection.", 404);
    }

    const section = await createCmsSection({
        section_id: crypto.randomUUID(),
        collection_id: collectionId,
        section_type: data.sectionType,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        background_image: data.backgroundImage ?? null,
        href: data.href ?? null,
        metadata: data.metadata ?? undefined,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
    });

    return { section };
};

export const updateCmsSectionService = async(
    sectionId: string,
    data: UpdateCmsSectionPayload
) => {
    const section = await findCmsSectionById(sectionId);

    if(!section) {
        throw new AppError("Không tìm thấy CMS section.", 404);
    }

    const updateData: any = {};

    if(data.sectionType !== undefined) updateData.section_type = data.sectionType;
    if(data.title !== undefined) updateData.title = data.title;
    if(data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if(data.backgroundImage !== undefined) updateData.background_image = data.backgroundImage;
    if(data.href !== undefined) updateData.href = data.href;
    if(data.metadata !== undefined) updateData.metadata = data.metadata;
    if(data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    if(data.isActive !== undefined) updateData.is_active = data.isActive;

    const updatedSection = await updateCmsSection(sectionId, updateData);

    return { section: updatedSection };
};

export const deleteCmsSectionService = async(sectionId: string) => {
    const section = await findCmsSectionById(sectionId);

    if(!section) {
        throw new AppError("Không tìm thấy CMS section.", 404);
    }

    const deletedSection = await deleteCmsSection(sectionId);

    return { section: deletedSection };
};

export const createCmsSectionItemService = async(
    sectionId: string,
    data: CreateCmsSectionItemPayload
) => {
    const section = await findCmsSectionById(sectionId);

    if(!section) {
        throw new AppError("Không tìm thấy CMS section.", 404);
    }

    const item = await createCmsSectionItem({
        item_id: crypto.randomUUID(),
        section_id: sectionId,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        image_url: data.imageUrl ?? null,
        href: data.href ?? null,
        product_id: data.productId ?? null,
        variant_id: data.variantId ?? null,
        blog_id: data.blogId ?? null,
        metadata: data.metadata ?? undefined,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
    });

    return { item };
};

export const updateCmsSectionItemService = async(
    itemId: string,
    data: UpdateCmsSectionItemPayload
) => {
    const item = await findCmsSectionItemById(itemId);

    if(!item) {
        throw new AppError("Không tìm thấy CMS section item.", 404);
    }

    const updateData: any = {};

    if(data.title !== undefined) updateData.title = data.title;
    if(data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if(data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if(data.href !== undefined) updateData.href = data.href;
    if(data.productId !== undefined) updateData.product_id = data.productId;
    if(data.variantId !== undefined) updateData.variant_id = data.variantId;
    if(data.blogId !== undefined) updateData.blog_id = data.blogId;
    if(data.metadata !== undefined) updateData.metadata = data.metadata;
    if(data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    if(data.isActive !== undefined) updateData.is_active = data.isActive;

    const updatedItem = await updateCmsSectionItem(itemId, updateData);

    return { item: updatedItem };
};

export const deleteCmsSectionItemService = async(itemId: string) => {
    const item = await findCmsSectionItemById(itemId);

    if(!item) {
        throw new AppError("Không tìm thấy CMS section item.", 404);
    }

    const deletedItem = await deleteCmsSectionItem(itemId);

    return { item: deletedItem };
};

export const createCmsRuleService = async(
    collectionId: string,
    data: CreateCmsRulePayload
) => {
    const collection = await findCmsCollectionById(collectionId);

    if(!collection) {
        throw new AppError("Không tìm thấy CMS collection.", 404);
    }

    const rule = await createCmsRule({
        rule_id: crypto.randomUUID(),
        collection_id: collectionId,
        category_id: data.categoryId ?? null,
        brand_id: data.brandId ?? null,
        attribute_name: data.attributeName ?? null,
        attribute_value: data.attributeValue ?? null,
        keyword: data.keyword ?? null,
        min_price: data.minPrice ?? null,
        max_price: data.maxPrice ?? null,
        sort_by: data.sortBy ?? "NEWEST",
        limit: data.limit ?? 20,
        metadata: data.metadata ?? undefined,
        is_active: data.isActive ?? true,
    });

    return { rule };
};

export const updateCmsRuleService = async(
    ruleId: string,
    data: UpdateCmsRulePayload
) => {
    const rule = await findCmsRuleById(ruleId);

    if(!rule) {
        throw new AppError("Không tìm thấy CMS rule.", 404);
    }

    const updateData: any = {};

    if(data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if(data.brandId !== undefined) updateData.brand_id = data.brandId;
    if(data.attributeName !== undefined) updateData.attribute_name = data.attributeName;
    if(data.attributeValue !== undefined) updateData.attribute_value = data.attributeValue;
    if(data.keyword !== undefined) updateData.keyword = data.keyword;
    if(data.minPrice !== undefined) updateData.min_price = data.minPrice;
    if(data.maxPrice !== undefined) updateData.max_price = data.maxPrice;
    if(data.sortBy !== undefined) updateData.sort_by = data.sortBy;
    if(data.limit !== undefined) updateData.limit = data.limit;
    if(data.metadata !== undefined) updateData.metadata = data.metadata;
    if(data.isActive !== undefined) updateData.is_active = data.isActive;

    const updatedRule = await updateCmsRule(ruleId, updateData);

    return { rule: updatedRule };
};

export const deleteCmsRuleService = async(ruleId: string) => {
    const rule = await findCmsRuleById(ruleId);

    if(!rule) {
        throw new AppError("Không tìm thấy CMS rule.", 404);
    }

    const deletedRule = await deleteCmsRule(ruleId);

    return { rule: deletedRule };
};
