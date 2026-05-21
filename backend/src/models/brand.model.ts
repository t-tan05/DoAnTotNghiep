import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findBrandById = async(brandId: string) => {
    return await prisma.brands.findUnique({
        where: {
            brand_id: brandId,
        },
    });
};

export const getAllBrand = async() => {
    return await prisma.brands.findMany({
        orderBy: {
            brand_name: "asc"
        },
    });
};

export const findBrandByNormalizeName = async(nomarlizeName: string) => {
    return await prisma.brands.findUnique({
        where: {
            normalized_name: nomarlizeName,
        },
    });
};

export const createBrand = async(brandId: string, brandName: string, normalizeName: string, description?: string) => {
    return prisma.brands.create({
        data: {
            brand_id: brandId,
            brand_name: brandName,
            normalized_name: normalizeName,
            description,
        },
    });
};

export const updateBrand = async(brandId: string, data: Prisma.brandsUpdateInput) => {
    return prisma.brands.update({
        where: {
            brand_id: brandId,
        },
        data,
    });
};