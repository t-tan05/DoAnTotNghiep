import prisma from "#config/prisma"

export const existAttributeValueByAttributeValueId = async(attributeValueId: string) => {
    return await prisma.variant_attribute_values.findFirst({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};

