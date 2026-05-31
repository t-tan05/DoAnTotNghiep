import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

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

export const getAllCategories = async() => {
    return await prisma.categories.findMany({
        orderBy: {
            category_name: "asc"
        },
    });
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