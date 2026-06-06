import prisma from "#config/prisma";
export const existAttributeValueByAttributeValueId = async (attributeValueId) => {
    return await prisma.variant_attribute_values.findFirst({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};
export const createVariantAttributeTransaction = async (tx, data) => {
    return await tx.variant_attribute_values.createMany({
        data,
    });
};
export const deleteVariantAttributeTransaction = async (tx, variantId) => {
    await tx.variant_attribute_values.deleteMany({
        where: {
            variant_id: variantId,
        }
    });
};
