import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findActiveCmsCollectionBySlug = async(slug: string) => {
    return prisma.cms_collections.findFirst({
        where: {
            slug,
            is_active: true,
        },
        include: {
            brands: true,
            categories: true,
            cms_sections: {
                where: {
                    is_active: true,
                },
                orderBy: {
                    sort_order: "asc",
                },
                include: {
                    cms_section_items: {
                        where: {
                            is_active: true,
                        },
                        orderBy: {
                            sort_order: "asc",
                        },
                        include: {
                            products: {
                                include: {
                                    brands: true,
                                    categories: true,
                                    product_images: true,
                                    product_variants: {
                                        include: {
                                            product_images: true,
                                            variant_attribute_values: {
                                                include: {
                                                    attribute_values: {
                                                        include: {
                                                            product_attributes: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            product_variants: {
                                include: {
                                    product_images: true,
                                    products: {
                                        include: {
                                            brands: true,
                                            categories: true,
                                            products_promotions: {
                                                include: {
                                                    promotions: true,
                                                },
                                            },
                                        },
                                    },
                                    variant_attribute_values: {
                                        include: {
                                            attribute_values: {
                                                include: {
                                                    product_attributes: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            blog_posts: true,
                        },
                    },
                },
            },
            cms_collection_rules: {
                where: {
                    is_active: true,
                },
                orderBy: {
                    created_at: "asc",
                },
            },
        },
    });
};

export const findPublicVariantsByCmsCollection = async({
    where,
    skip,
    take,
    orderBy,
}: {
    where: any;
    skip: number;
    take: number;
    orderBy: any;
}) => {
    const [items, total] = await Promise.all([
        prisma.product_variants.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                products: {
                    include: {
                        brands: true,
                        categories: true,
                        products_promotions: {
                            include: {
                                promotions: true,
                            },
                        },
                    },
                },
                product_images: {
                    orderBy: [
                        { is_default: "desc" },
                        { image_id: "asc" },
                    ],
                },
                variant_attribute_values: {
                    include: {
                        attribute_values: {
                            include: {
                                product_attributes: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.product_variants.count({where}),
    ]);

    return {items, total};
}

export const findCmsFilterVariants = async(where: any) => {
    return prisma.product_variants.findMany({
        where,
        select: {
            price: true,

            products: {
                select: {
                    brands: {
                        select: {
                            brand_id: true,
                            brand_name: true,
                        },
                    },
                    categories: {
                        select: {
                            category_id: true,
                            category_name: true,
                        },
                    },
                },
            },

            variant_attribute_values: {
                select: {
                    attribute_values: {
                        select: {
                            attribute_value_id: true,
                            value: true,
                            display_order: true,
                            product_attributes: {
                                select: {
                                    attribute_id: true,
                                    attribute_name: true,
                                    display_order: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const findCmsCollectionById = async(collectionId: string) => {
    return prisma.cms_collections.findUnique({
        where: {
            collection_id: collectionId,
        },
        include: {
            brands: true,
            categories: true,
            cms_sections: {
                orderBy: {
                    sort_order: "asc",
                },
                include: {
                    cms_section_items: {
                        orderBy: {
                            sort_order: "asc",
                        },
                        include: {
                            products: true,
                            product_variants: true,
                            blog_posts: true,
                        },
                    },
                },
            },
            cms_collection_rules: true,
        },
    });
};

export const findCmsCollectionBySlug = async(slug: string) => {
    return prisma.cms_collections.findUnique({
        where: {
            slug,
        },
    });
};

export const getAdminCmsCollections = async({
    where,
    skip,
    take,
    orderBy,
}: {
    where: Prisma.cms_collectionsWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.cms_collectionsOrderByWithRelationInput[];
}) => {
    const [collections, total] = await Promise.all([
        prisma.cms_collections.findMany({
            where,
            skip,
            take,
            include: {
                brands: true,
                categories: true,
                _count: {
                    select: {
                        cms_sections: true,
                        cms_collection_rules: true,
                    },
                },
            },
            orderBy,
        }),
        prisma.cms_collections.count({ where }),
    ]);

    return { collections, total };
};

export const findPublicCmsCollectionSuggestions = async(search: string, limit: number) => {
    const keyword = search.trim();

    return prisma.cms_collections.findMany({
        where: {
            is_active: true,
            OR: [
                { title: { contains: keyword } },
                { slug: { contains: keyword } },
                { description: { contains: keyword } },
                { categories: { category_name: { contains: keyword } } },
                { brands: { brand_name: { contains: keyword } } },
            ],
        },
        select: {
            collection_id: true,
            title: true,
            slug: true,
            page_type: true,
        },
        orderBy: [
            { sort_order: "asc" },
            { created_at: "desc" },
        ],
        take: limit,
    });
};

export const createCmsCollection = async(data: Prisma.cms_collectionsUncheckedCreateInput) => {
    return prisma.cms_collections.create({
        data,
    });
};

export const updateCmsCollection = async(collectionId: string, data: Prisma.cms_collectionsUncheckedUpdateInput) => {
    return prisma.cms_collections.update({
        where: {
            collection_id: collectionId,
        },
        data,
    });
};

export const deleteCmsCollection = async(collectionId: string) => {
    return prisma.cms_collections.delete({
        where: {
            collection_id: collectionId,
        },
    });
};

export const findCmsSectionById = async(sectionId: string) => {
    return prisma.cms_sections.findUnique({
        where: {
            section_id: sectionId,
        },
        include: {
            cms_collections: true,
            cms_section_items: {
                orderBy: {
                    sort_order: "asc",
                },
                include: {
                    products: true,
                    product_variants: true,
                    blog_posts: true,
                },
            },
        },
    });
};

export const createCmsSection = async(data: Prisma.cms_sectionsUncheckedCreateInput) => {
    return prisma.cms_sections.create({
        data,
    });
};

export const updateCmsSection = async(sectionId: string, data: Prisma.cms_sectionsUncheckedUpdateInput) => {
    return prisma.cms_sections.update({
        where: {
            section_id: sectionId,
        },
        data,
    });
};

export const deleteCmsSection = async(sectionId: string) => {
    return prisma.cms_sections.delete({
        where: {
            section_id: sectionId,
        },
    });
};

export const findCmsSectionItemById = async(itemId: string) => {
    return prisma.cms_section_items.findUnique({
        where: {
            item_id: itemId,
        },
        include: {
            cms_sections: true,
            products: true,
            product_variants: true,
            blog_posts: true,
        },
    });
};

export const createCmsSectionItem = async(data: Prisma.cms_section_itemsUncheckedCreateInput) => {
    return prisma.cms_section_items.create({
        data,
    });
};

export const createCmsSectionItems = async(data: Prisma.cms_section_itemsUncheckedCreateInput[]) => {
    return prisma.$transaction(
        data.map((item) => prisma.cms_section_items.create({ data: item })),
    );
};

export const updateCmsSectionItem = async(itemId: string, data: Prisma.cms_section_itemsUncheckedUpdateInput) => {
    return prisma.cms_section_items.update({
        where: {
            item_id: itemId,
        },
        data,
    });
};

export const deleteCmsSectionItem = async(itemId: string) => {
    return prisma.cms_section_items.delete({
        where: {
            item_id: itemId,
        },
    });
};

export const findCmsRuleById = async(ruleId: string) => {
    return prisma.cms_collection_rules.findUnique({
        where: {
            rule_id: ruleId,
        },
        include: {
            cms_collections: true,
            brands: true,
            categories: true,
        },
    });
};

export const createCmsRule = async(data: Prisma.cms_collection_rulesUncheckedCreateInput) => {
    return prisma.cms_collection_rules.create({
        data,
    });
};

export const updateCmsRule = async(ruleId: string, data: Prisma.cms_collection_rulesUncheckedUpdateInput) => {
    return prisma.cms_collection_rules.update({
        where: {
            rule_id: ruleId,
        },
        data,
    });
};

export const deleteCmsRule = async(ruleId: string) => {
    return prisma.cms_collection_rules.delete({
        where: {
            rule_id: ruleId,
        },
    });
};
