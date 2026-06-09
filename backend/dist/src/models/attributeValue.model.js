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
export const findAttributeValuesByNormalizedValues = async (attributteId, normalizedValues) => {
    return await prisma.attribute_values.findMany({
        where: {
            attribute_id: attributteId,
            normalized_value: {
                in: normalizedValues
            },
        },
    });
};
export const createAttributeValues = async (data) => {
    return await prisma.attribute_values.createMany({
        data,
    });
};
export const findAttributeValueByProductAttributeId = async (attributeId) => {
    return await prisma.attribute_values.findFirst({
        where: {
            attribute_id: attributeId,
        },
    });
};
export const findAttributeValueById = async (attributeValueId) => {
    return await prisma.attribute_values.findUnique({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};
export const findAttributeValueByAttributeAndNormalizedValue = async (attributeId, normalizedValue) => {
    return await prisma.attribute_values.findFirst({
        where: {
            attribute_id: attributeId,
            normalized_value: normalizedValue,
        },
    });
};
export const updateAttributeValue = async (attributeValueId, data) => {
    return await prisma.attribute_values.update({
        where: {
            attribute_value_id: attributeValueId,
        },
        data,
    });
};
export const deleteAttributeValue = async (attributeValueId) => {
    return await prisma.attribute_values.delete({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};
