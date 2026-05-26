import prisma from "#config/prisma";
export const findBrandById = async (brandId) => {
    return await prisma.brands.findUnique({
        where: {
            brand_id: brandId,
        },
    });
};
export const getAllBrand = async () => {
    return await prisma.brands.findMany({
        orderBy: {
            brand_name: "asc"
        },
    });
};
export const findBrandByNormalizeName = async (nomarlizeName) => {
    return await prisma.brands.findUnique({
        where: {
            normalized_name: nomarlizeName,
        },
    });
};
export const createBrand = async (brandId, brandName, normalizeName, description) => {
    return await prisma.brands.create({
        data: {
            brand_id: brandId,
            brand_name: brandName,
            normalized_name: normalizeName,
            description,
        },
    });
};
export const updateBrand = async (brandId, data) => {
    return await prisma.brands.update({
        where: {
            brand_id: brandId,
        },
        data,
    });
};
