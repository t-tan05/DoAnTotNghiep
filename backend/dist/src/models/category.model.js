import prisma from "#config/prisma";
export const findCategoryById = async (categoryId) => {
    return prisma.categories.findUnique({
        where: {
            category_id: categoryId,
        },
    });
};
export const findCategoryByNormalizeName = async (normalizeName) => {
    return prisma.categories.findUnique({
        where: {
            normalized_name: normalizeName,
        },
    });
};
export const createCategory = async (categoryId, categoryName, normalizeName, description) => {
    return prisma.categories.create({
        data: {
            category_id: categoryId,
            category_name: categoryName,
            normalized_name: normalizeName,
            description,
        },
    });
};
export const getAllCategories = async () => {
    return prisma.categories.findMany({
        orderBy: {
            category_name: "asc"
        },
    });
};
export const updateCategory = async (categoryId, data) => {
    return prisma.categories.update({
        where: {
            category_id: categoryId,
        },
        data,
    });
};
export const deleteCategoryById = async (categoryId) => {
};
