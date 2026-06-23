import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";
import { ListQuery } from "#types/pagination.type";
import { normalizeText } from "#utils/normalizeText";

export type ProductSortBy = "product_name" | "created_at" | "warranty_period";
export type ProductListQuery = ListQuery<ProductSortBy> & {
    brandId?: string;
    categoryId?: string;
};

export const findProductByNormalizeName = async(normalizedName: string) => {
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
            statistics_products: true,
            reviews: true,
        }
    });
};

export const createProduct = async(data: Prisma.productsUncheckedCreateInput) => {
    return await prisma.products.create({data});
};

export const findProductById = async(productId: string) => {
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

export const getProductWithQuery = async(params: ProductListQuery) => {
    const {page, limit, search, sortBy, sortOrder, brandId, categoryId} = params;
    const skip = (page - 1) * limit;

    const where: Prisma.productsWhereInput = {
        ...(search 
        ?   {
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
            ],
        }
        : {}),
        ...(brandId ? {brand_id: brandId} : {}),

        ...(categoryId ? {category_id: categoryId} : {}),
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
}

export const updateProduct = async(productId: string, data: Prisma.productsUncheckedUpdateInput) => {
    return await prisma.products.update({
        where: {
            product_id: productId,
        },
        data
    });
};

export const deleteProduct =async(productId: string) => {
    return await prisma.products.delete({
        where: {
            product_id: productId
        },
    });
};

export const findProductByCategoryId = async(categoryId: string) => {
    return await prisma.products.findFirst({
        where: {
            categories: {
                category_id: categoryId,
            },
        },
    });
};

export const findProductByBrandId = async(brandId: string) => {
    return await prisma.products.findFirst({
        where: {
            brands: {
                brand_id: brandId,
            },
        },
    });
};
