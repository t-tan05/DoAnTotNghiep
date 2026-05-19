import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findCategoryById = async(categoryId: string) => {
    return prisma.categories.findUnique({
        where: {
            category_id: categoryId,
        },
    });
};

export const findCategoryByName = async(categoryName: string) => {
    return prisma.categories.findUnique({
        where: {
            category_name: categoryName,
        },
    });
};

export const findCategoryByNormalizeName = async(normalizeName: string) => {
    return prisma.categories.findUnique({
        where: {
            normalized_name: normalizeName,
        },
    });
};

export const createCategory = async(categoryId: string, categoryName: string, normalizeName: string, description?: string) => {
    return prisma.categories.create({
        data: {
            category_id: categoryId,
            category_name: categoryName,
            normalized_name: normalizeName,
            description,
        },
    });
};

export const getAllCategories = async() => {
    return prisma.categories.findMany({
        orderBy: {
            category_name: "asc"
        },
    });
};

export const updateCategory = async(categoryId: string, data: Prisma.categoriesUpdateInput) => {
    return prisma.categories.update({
        where: {
            category_id: categoryId,
        },
        data,
    });
};

export const deleteCategoryById = async(categoryId: string) => {

};