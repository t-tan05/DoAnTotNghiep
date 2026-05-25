import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findVariantBySku = async(sku: string) => {
    return await prisma.product_variants.findUnique({
        where: {
            sku,
        },
    });
};

export const createProductVariantTransaction = async(
    tx: Prisma.TransactionClient, 
    data: Prisma.product_variantsUncheckedCreateInput[]
) => {
    return await tx.product_variants.createMany({
        data,
    });
};

