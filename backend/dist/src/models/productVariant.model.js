import prisma from "#config/prisma";
export const findVariantBySku = async (sku) => {
    return await prisma.product_variants.findUnique({
        where: {
            sku,
        },
    });
};
export const createProductVariantTransaction = async (tx, data) => {
    return await tx.product_variants.createMany({
        data,
    });
};
