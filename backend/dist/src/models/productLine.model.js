import prisma from "#config/prisma";
import { normalizeText } from "#utils/normalizeText";
export const findProductLineById = async (lineId) => {
    return prisma.product_lines.findUnique({
        where: {
            line_id: lineId,
        },
        include: {
            brands: true,
            categories: true,
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
};
export const findProductLineByScopeSlug = async ({ brandId, categoryId, slug, }) => {
    return prisma.product_lines.findFirst({
        where: {
            brand_id: brandId,
            category_id: categoryId,
            slug,
        },
    });
};
export const getProductLinesWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder, brandId, categoryId, isActive } = params;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
        where.OR = [
            {
                line_name: {
                    contains: search,
                },
            },
            {
                normalized_name: {
                    contains: normalizeText(search),
                },
            },
            {
                slug: {
                    contains: normalizeText(search).replace(/\s+/g, "-"),
                },
            },
            {
                description: {
                    contains: search,
                },
            },
            {
                brands: {
                    brand_name: {
                        contains: search,
                    },
                },
            },
            {
                categories: {
                    category_name: {
                        contains: search,
                    },
                },
            },
        ];
    }
    if (brandId) {
        where.brand_id = brandId;
    }
    if (categoryId) {
        where.category_id = categoryId;
    }
    if (isActive !== undefined) {
        where.is_active = isActive;
    }
    const [productLines, totalItems] = await prisma.$transaction([
        prisma.product_lines.findMany({
            where,
            skip,
            take: limit,
            include: {
                brands: true,
                categories: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: [
                {
                    [sortBy]: sortOrder,
                },
                {
                    line_name: "asc",
                },
            ],
        }),
        prisma.product_lines.count({
            where,
        }),
    ]);
    return {
        productLines,
        totalItems,
    };
};
export const createProductLine = async (data) => {
    return prisma.product_lines.create({
        data,
    });
};
export const updateProductLine = async (lineId, data) => {
    return prisma.product_lines.update({
        where: {
            line_id: lineId,
        },
        data,
    });
};
export const deleteProductLineById = async (lineId) => {
    return prisma.product_lines.delete({
        where: {
            line_id: lineId,
        },
    });
};
