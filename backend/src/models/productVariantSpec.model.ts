import { Prisma } from "@prisma/client";

export const createProductVariantSpecTransaction = async(
    tx: Prisma.TransactionClient,
    data: Prisma.product_variant_specsUncheckedCreateInput[]
) => {
    return await tx.product_variant_specs.createMany({
        data,
    });
};

export const deleteProductVariantSpecTransaction = async(
    tx: Prisma.TransactionClient,
    variantId: string
) => {
    return await tx.product_variant_specs.deleteMany({
        where: {
            variant_id: variantId,
        },
    });
};