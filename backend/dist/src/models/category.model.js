import prisma from "#config/prisma";
import { normalizeText } from "#utils/normalizeText";
export const findCategoryById = async (categoryId) => {
    return await prisma.categories.findUnique({
        where: {
            category_id: categoryId,
        },
    });
};
export const findCategoryByNormalizeName = async (normalizeName) => {
    return await prisma.categories.findUnique({
        where: {
            normalized_name: normalizeName,
        },
    });
};
export const createCategory = async (categoryId, categoryName, normalizeName, description) => {
    return await prisma.categories.create({
        data: {
            category_id: categoryId,
            category_name: categoryName,
            normalized_name: normalizeName,
            description,
        },
    });
};
export const getCategoriesWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                {
                    category_name: {
                        contains: search,
                    },
                },
                {
                    normalized_name: {
                        contains: normalizeText(search),
                    },
                },
                {
                    description: {
                        contains: search,
                    },
                },
            ],
        }
        :
            {};
    const [categories, totalItems] = await prisma.$transaction([
        prisma.categories.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.categories.count({
            where,
        }),
    ]);
    return {
        categories,
        totalItems,
    };
};
export const updateCategory = async (categoryId, data) => {
    return await prisma.categories.update({
        where: {
            category_id: categoryId,
        },
        data,
    });
};
export const deleteCategoryById = async (categoryId) => {
    return await prisma.categories.delete({
        where: {
            category_id: categoryId,
        },
    });
};
export const getCategoryDeleteUsage = async (categoryId) => {
    const [productCount, productLineCount, cmsCollectionCount, cmsRuleCount] = await prisma.$transaction([
        prisma.products.count({ where: { category_id: categoryId } }),
        prisma.product_lines.count({ where: { category_id: categoryId } }),
        prisma.cms_collections.count({ where: { category_id: categoryId } }),
        prisma.cms_collection_rules.count({ where: { category_id: categoryId } }),
    ]);
    return { productCount, productLineCount, cmsCollectionCount, cmsRuleCount };
};
