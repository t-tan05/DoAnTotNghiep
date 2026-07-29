import prisma from "#config/prisma";
import { normalizeText } from "#utils/normalizeText";
export const findBrandById = async (brandId) => {
    return await prisma.brands.findUnique({
        where: {
            brand_id: brandId,
        },
    });
};
export const getBrandsWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const where = search
        ? {
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
export const deleteBrandById = async (brandId) => {
    return await prisma.brands.delete({
        where: {
            brand_id: brandId,
        },
    });
};
export const getBrandDeleteUsage = async (brandId) => {
    const [productCount, productLineCount, cmsCollectionCount, cmsRuleCount] = await prisma.$transaction([
        prisma.products.count({ where: { brand_id: brandId } }),
        prisma.product_lines.count({ where: { brand_id: brandId } }),
        prisma.cms_collections.count({ where: { brand_id: brandId } }),
        prisma.cms_collection_rules.count({ where: { brand_id: brandId } }),
    ]);
    return { productCount, productLineCount, cmsCollectionCount, cmsRuleCount };
};
