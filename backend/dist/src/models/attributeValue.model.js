import prisma from "#config/prisma";
export const findAttributeValuesByIds = async (attributeValueIds) => {
    return await prisma.attribute_values.findMany({
        where: {
            attribute_value_id: {
                in: attributeValueIds,
            }
        }
    });
};
