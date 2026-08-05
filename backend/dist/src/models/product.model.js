import prisma from "#config/prisma";
import { normalizeText } from "#utils/normalizeText";
export const findProductByNormalizeName = async (normalizedName) => {
    return await prisma.products.findUnique({
        where: {
            normalized_name: normalizedName,
        },
        include: {
            brands: true,
            categories: true,
            product_images: true,
            product_variants: true,
            products_promotions: true,
            reviews: true,
            product_lines: true,
        }
    });
};
export const createProduct = async (data) => {
    return await prisma.products.create({ data });
};
export const findProductById = async (productId) => {
    return await prisma.products.findUnique({
        where: {
            product_id: productId,
        },
        select: {
            product_id: true,
            product_name: true,
            description: true,
            warranty_period: true,
            created_at: true,
            updated_at: true,
            line_id: true,
            brands: {
                select: {
                    brand_id: true,
                    brand_name: true
                }
            },
            categories: {
                select: {
                    category_id: true,
                    category_name: true
                }
            },
            product_lines: {
                select: {
                    line_id: true,
                    line_name: true,
                    slug: true,
                    brand_id: true,
                    category_id: true,
                },
            },
            product_images: {
                select: {
                    image_id: true,
                    image_url: true,
                    is_default: true,
                },
                where: {
                    variant_id: null,
                },
                orderBy: {
                    is_default: "desc",
                },
            },
            product_variants: {
                select: {
                    variant_id: true,
                    sku: true,
                    variant_name: true,
                    detail_description: true,
                    price: true,
                    quantity_in_stock: true,
                    reserved_quantity: true,
                    sold_quantity: true,
                    image_url: true,
                    public_id: true,
                    product_images: {
                        select: {
                            image_id: true,
                            image_url: true,
                            is_default: true
                        }
                    },
                    variant_attribute_values: {
                        select: {
                            attribute_values: {
                                select: {
                                    attribute_value_id: true,
                                    value: true,
                                    product_attributes: {
                                        select: {
                                            attribute_id: true,
                                            attribute_name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    product_variant_specs: {
                        select: {
                            spec_key: true,
                            spec_value: true,
                            display_order: true
                        },
                        orderBy: {
                            display_order: "asc"
                        }
                    }
                }
            },
            products_promotions: {
                select: {
                    promotions: {
                        select: {
                            promotion_id: true,
                            promotion_name: true,
                            discount_type: true,
                            discount_value: true,
                            start_date: true,
                            end_date: true,
                            is_active: true,
                        },
                    },
                },
            },
        }
    });
};
export const getProductWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder, brandId, categoryId, lineId } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(search
            ? {
                OR: [
                    {
                        product_name: {
                            contains: search
                        }
                    },
                    {
                        normalized_name: {
                            contains: normalizeText(search)
                        }
                    },
                    {
                        description: {
                            contains: search
                        }
                    },
                    {
                        brands: {
                            brand_name: {
                                contains: search
                            }
                        }
                    },
                    {
                        categories: {
                            category_name: {
                                contains: search
                            }
                        }
                    },
                    {
                        product_lines: {
                            line_name: {
                                contains: search
                            }
                        }
                    },
                ],
            }
            : {}),
        ...(brandId ? { brand_id: brandId } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(lineId ? { line_id: lineId } : {}),
    };
    const [products, totalItems] = await prisma.$transaction([
        prisma.products.findMany({
            where,
            skip,
            take: limit,
            select: {
                product_id: true,
                product_name: true,
                description: true,
                warranty_period: true,
                created_at: true,
                line_id: true,
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
                product_lines: {
                    select: {
                        line_id: true,
                        line_name: true,
                        slug: true,
                        brand_id: true,
                        category_id: true,
                    },
                },
                product_variants: {
                    select: {
                        variant_id: true,
                        sku: true,
                        variant_name: true,
                        price: true,
                        quantity_in_stock: true,
                        image_url: true,
                        public_id: true,
                        product_images: {
                            select: {
                                image_url: true,
                                is_default: true,
                            },
                            where: {
                                is_default: true,
                            },
                            take: 1,
                        },
                    },
                },
                products_promotions: {
                    select: {
                        promotions: {
                            select: {
                                promotion_id: true,
                                promotion_name: true,
                                discount_type: true,
                                discount_value: true,
                                start_date: true,
                                end_date: true,
                                is_active: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.products.count({
            where,
        }),
    ]);
    return {
        products,
        totalItems,
    };
};
export const updateProduct = async (productId, data) => {
    return await prisma.products.update({
        where: {
            product_id: productId,
        },
        data
    });
};
export const deleteProduct = async (productId) => {
    return await prisma.products.delete({
        where: {
            product_id: productId
        },
    });
};
export const findProductByCategoryId = async (categoryId) => {
    return await prisma.products.findFirst({
        where: {
            categories: {
                category_id: categoryId,
            },
        },
    });
};
export const findProductByBrandId = async (brandId) => {
    return await prisma.products.findFirst({
        where: {
            brands: {
                brand_id: brandId,
            },
        },
    });
};
export const getPublicProductsPageWithQuery = async (params) => {
    const { page, limit, search, categoryId, brandId, minPrice, maxPrice, sortBy, } = params;
    const skip = (page - 1) * limit;
    const variantPriceWhere = minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
        }
        : {};
    const productWhere = {
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(brandId ? { brand_id: brandId } : {}),
        ...(Object.keys(variantPriceWhere).length > 0
            ? {
                product_variants: {
                    some: variantPriceWhere,
                },
            }
            : {}),
        ...(search
            ? {
                OR: [
                    { product_name: { contains: search } },
                    { normalized_name: { contains: normalizeText(search) } },
                    { brands: { brand_name: { contains: search } } },
                    { categories: { category_name: { contains: search } } },
                    {
                        product_variants: {
                            some: {
                                OR: [
                                    { variant_name: { contains: search } },
                                    { sku: { contains: search } },
                                    {
                                        variant_attribute_values: {
                                            some: {
                                                attribute_values: {
                                                    value: {
                                                        contains: search,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    {
                                        product_variant_specs: {
                                            some: {
                                                spec_value: {
                                                    contains: search,
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            }
            : {}),
    };
    let productOrderBy = {
        created_at: "desc",
    };
    if (sortBy === "name_asc") {
        productOrderBy = {
            product_name: "asc",
        };
    }
    const [products, totalItems] = await prisma.$transaction([
        prisma.products.findMany({
            where: productWhere,
            skip,
            take: limit,
            orderBy: productOrderBy,
            select: {
                product_id: true,
            },
        }),
        prisma.products.count({
            where: productWhere,
        }),
    ]);
    const productIds = products.map((product) => product.product_id);
    if (productIds.length === 0) {
        return {
            variants: [],
            totalItems,
        };
    }
    const variants = await prisma.product_variants.findMany({
        where: {
            product_id: {
                in: productIds,
            },
            ...variantPriceWhere,
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            variant_id: true,
            product_id: true,
            sku: true,
            variant_name: true,
            price: true,
            quantity_in_stock: true,
            image_url: true,
            created_at: true,
            product_images: {
                select: {
                    image_url: true,
                    is_default: true,
                },
                orderBy: {
                    is_default: "desc",
                },
                take: 1,
            },
            variant_attribute_values: {
                select: {
                    attribute_values: {
                        select: {
                            attribute_value_id: true,
                            value: true,
                            product_attributes: {
                                select: {
                                    attribute_id: true,
                                    attribute_name: true,
                                },
                            },
                        },
                    },
                },
            },
            products: {
                select: {
                    product_id: true,
                    product_name: true,
                    warranty_period: true,
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
                    products_promotions: {
                        select: {
                            promotions: {
                                select: {
                                    promotion_id: true,
                                    promotion_name: true,
                                    discount_type: true,
                                    discount_value: true,
                                    start_date: true,
                                    end_date: true,
                                    is_active: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return {
        variants,
        totalItems,
    };
};
export const getPublicProductFilterOptions = async () => {
    const [brands, categories, priceAggregate] = await prisma.$transaction([
        prisma.brands.findMany({
            select: {
                brand_id: true,
                brand_name: true,
            },
            orderBy: {
                brand_name: "asc",
            },
        }),
        prisma.categories.findMany({
            select: {
                category_id: true,
                category_name: true,
            },
            orderBy: {
                category_name: "asc",
            },
        }),
        prisma.product_variants.aggregate({
            _max: {
                price: true,
            },
        }),
    ]);
    return {
        brands,
        categories,
        maxPrice: Number(priceAggregate._max.price ?? 0),
    };
};
export const getRelatedProductVariants = async (params) => {
    const where = {
        products: {
            product_id: {
                not: params.productId,
            },
            OR: [
                ...(params.lineId ? [{ line_id: params.lineId }] : []),
                { brand_id: params.brandId },
            ],
        },
    };
    const variants = await prisma.product_variants.findMany({
        where,
        take: 200,
        orderBy: [
            { sold_quantity: "desc" },
            { created_at: "desc" },
        ],
        select: {
            variant_id: true,
            product_id: true,
            sku: true,
            variant_name: true,
            price: true,
            quantity_in_stock: true,
            image_url: true,
            created_at: true,
            product_images: {
                select: {
                    image_url: true,
                    is_default: true,
                },
                orderBy: {
                    is_default: "desc",
                },
                take: 1,
            },
            variant_attribute_values: {
                select: {
                    attribute_values: {
                        select: {
                            attribute_value_id: true,
                            value: true,
                            product_attributes: {
                                select: {
                                    attribute_id: true,
                                    attribute_name: true,
                                },
                            },
                        },
                    },
                },
            },
            products: {
                select: {
                    product_id: true,
                    product_name: true,
                    warranty_period: true,
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
                    products_promotions: {
                        select: {
                            promotions: {
                                select: {
                                    promotion_id: true,
                                    promotion_name: true,
                                    discount_type: true,
                                    discount_value: true,
                                    start_date: true,
                                    end_date: true,
                                    is_active: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return { variants };
};
export const getProductDeleteUsage = async (productId) => {
    const [variantCount, orderDetailCount, reviewCount, promotionCount,] = await prisma.$transaction([
        prisma.product_variants.count({ where: { product_id: productId } }),
        prisma.orders_details.count({
            where: {
                product_variants: {
                    product_id: productId,
                },
            },
        }),
        prisma.reviews.count({ where: { product_id: productId } }),
        prisma.products_promotions.count({ where: { product_id: productId } }),
    ]);
    return {
        variantCount,
        orderDetailCount,
        reviewCount,
        promotionCount,
    };
};
