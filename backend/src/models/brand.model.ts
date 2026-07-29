import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";
import { ListQuery } from "#types/pagination.type";
import { normalizeText } from "#utils/normalizeText";

export type BrandSortBy = "brand_name";

export const findBrandById = async(brandId: string) => {
    return await prisma.brands.findUnique({
        where: {
            brand_id: brandId,
        },
    });
};

export const getBrandsWithQuery = async(params: ListQuery<BrandSortBy>) => {
    const {page, limit, search, sortBy, sortOrder} = params;

    const skip = (page - 1) * limit;

    const where: Prisma.brandsWhereInput = search
        ?   {
                OR: [
                    {
                        brand_name: {
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

    const [brands, totalItems] = await prisma.$transaction([
        prisma.brands.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.brands.count({
            where,
        }),
    ]);
    
    return {
        brands,
        totalItems,
    };
}

export const findBrandByNormalizeName = async(nomarlizeName: string) => {
    return await prisma.brands.findUnique({
        where: {
            normalized_name: nomarlizeName,
        },
    });
};

export const createBrand = async(brandId: string, brandName: string, normalizeName: string, description?: string) => {
    return await prisma.brands.create({
        data: {
            brand_id: brandId,
            brand_name: brandName,
            normalized_name: normalizeName,
            description,
        },
    });
};

export const updateBrand = async(brandId: string, data: Prisma.brandsUpdateInput) => {
    return await prisma.brands.update({
        where: {
            brand_id: brandId,
        },
        data,
    });
};

export const deleteBrandById = async(brandId: string) => {
    return await prisma.brands.delete({
        where: {
            brand_id: brandId,
        },
    });
};

export const getBrandDeleteUsage = async(brandId: string) => {
    const [productCount, productLineCount, cmsCollectionCount, cmsRuleCount] = await prisma.$transaction([
        prisma.products.count({where: {brand_id: brandId}}),
        prisma.product_lines.count({where: {brand_id: brandId}}),
        prisma.cms_collections.count({where: {brand_id: brandId}}),
        prisma.cms_collection_rules.count({where: {brand_id: brandId}}),
    ]);

    return {productCount, productLineCount, cmsCollectionCount, cmsRuleCount};
}