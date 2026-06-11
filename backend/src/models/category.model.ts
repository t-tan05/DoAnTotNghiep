import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";
import { ListQuery } from "#types/pagination.type";
import { normalizeText } from "#utils/normalizeText";

export type CategorySortBy = "category_name";

export const findCategoryById = async(categoryId: string) => {
    return await prisma.categories.findUnique({
        where: {
            category_id: categoryId,
        },
    });
};

export const findCategoryByNormalizeName = async(normalizeName: string) => {
    return await prisma.categories.findUnique({
        where: {
            normalized_name: normalizeName,
        },
    });
};

export const createCategory = async(categoryId: string, categoryName: string, normalizeName: string, description?: string) => {
    return await prisma.categories.create({
        data: {
            category_id: categoryId,
            category_name: categoryName,
            normalized_name: normalizeName,
            description,
        },
    });
};

export const getCategoriesWithQuery = async(params: ListQuery<CategorySortBy>) => {
    const {page, limit, search, sortBy, sortOrder} = params;
    const skip = (page - 1) * limit;

    const where: Prisma.categoriesWhereInput = search
        ?   {
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
                [sortBy] : sortOrder,
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

export const updateCategory = async(categoryId: string, data: Prisma.categoriesUpdateInput) => {
    return await prisma.categories.update({
        where: {
            category_id: categoryId,
        },
        data,
    });
};

export const deleteCategoryById = async(categoryId: string) => {
    return await prisma.categories.delete({
        where: {
            category_id: categoryId,
        },
    });
};