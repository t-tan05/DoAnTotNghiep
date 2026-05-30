import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const existAttributeValueByAttributeValueId = async(attributeValueId: string) => {
    return await prisma.variant_attribute_values.findFirst({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};

export const createVariantAttributeTransaction = async(
    tx: Prisma.TransactionClient, 
    data: Prisma.variant_attribute_valuesUncheckedCreateInput[]
) => {
    return await tx.variant_attribute_values.createMany({
        data,
    });
};

export const deleteVariantAttributeTransaction = async(
    tx: Prisma.TransactionClient,
    variantId: string
) => {
    await tx.variant_attribute_values.deleteMany({
        where: {
            variant_id: variantId,
        }
    })
}