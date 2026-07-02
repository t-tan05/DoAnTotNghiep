import prisma from "#config/prisma";
export const findActiveCmsCollectionBySlug = async (slug) => {
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
export const findPublicVariantsByCmsCollection = async ({ where, skip, take, orderBy, }) => {
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
        prisma.product_variants.count({ where }),
    ]);
    return { items, total };
};
export const findCmsFilterVariants = async (where) => {
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
export const findCmsCollectionById = async (collectionId) => {
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
export const findCmsCollectionBySlug = async (slug) => {
    return prisma.cms_collections.findUnique({
        where: {
            slug,
        },
    });
};
export const getAdminCmsCollections = async ({ where, skip, take, orderBy, }) => {
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
export const createCmsCollection = async (data) => {
    return prisma.cms_collections.create({
        data,
    });
};
export const updateCmsCollection = async (collectionId, data) => {
    return prisma.cms_collections.update({
        where: {
            collection_id: collectionId,
        },
        data,
    });
};
export const deleteCmsCollection = async (collectionId) => {
    return prisma.cms_collections.delete({
        where: {
            collection_id: collectionId,
        },
    });
};
export const findCmsSectionById = async (sectionId) => {
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
export const createCmsSection = async (data) => {
    return prisma.cms_sections.create({
        data,
    });
};
export const updateCmsSection = async (sectionId, data) => {
    return prisma.cms_sections.update({
        where: {
            section_id: sectionId,
        },
        data,
    });
};
export const deleteCmsSection = async (sectionId) => {
    return prisma.cms_sections.delete({
        where: {
            section_id: sectionId,
        },
    });
};
export const findCmsSectionItemById = async (itemId) => {
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
export const createCmsSectionItem = async (data) => {
    return prisma.cms_section_items.create({
        data,
    });
};
export const updateCmsSectionItem = async (itemId, data) => {
    return prisma.cms_section_items.update({
        where: {
            item_id: itemId,
        },
        data,
    });
};
export const deleteCmsSectionItem = async (itemId) => {
    return prisma.cms_section_items.delete({
        where: {
            item_id: itemId,
        },
    });
};
export const findCmsRuleById = async (ruleId) => {
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
export const createCmsRule = async (data) => {
    return prisma.cms_collection_rules.create({
        data,
    });
};
export const updateCmsRule = async (ruleId, data) => {
    return prisma.cms_collection_rules.update({
        where: {
            rule_id: ruleId,
        },
        data,
    });
};
export const deleteCmsRule = async (ruleId) => {
    return prisma.cms_collection_rules.delete({
        where: {
            rule_id: ruleId,
        },
    });
};
