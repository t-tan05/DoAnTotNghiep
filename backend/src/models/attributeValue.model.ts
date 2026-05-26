import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findAttributeValuesByIds = async(attributeValueIds: string[]) => {
    return await prisma.attribute_values.findMany({
        where: {
            attribute_value_id: {
                in: attributeValueIds,
            }
        }
    })
}

export const findAttributeValuesByNormalizedValues = async(attributteId: string, normalizedValues: string[]) => {
    return await prisma.attribute_values.findMany({
        where: {
            attribute_id: attributteId,
            normalized_value: {
                in: normalizedValues
            },
        },
    });
};

export const createAttributeValues = async(data: Prisma.attribute_valuesUncheckedCreateInput[]) => {
    return await prisma.attribute_values.createMany({
        data,
    });
};

export const findAttributeValueByProductAttributeId = async(attributeId: string) => {
    return await prisma.attribute_values.findFirst({
        where: {
            attribute_id: attributeId,
        },
    });
};

export const findAttributeValueById = async(attributeValueId: string) => {
    return await prisma.attribute_values.findUnique({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};

export const findAttributeValueByNormalizedValue = async(normalizedValue: string) => {
    return await prisma.attribute_values.findUnique({
        where: {
            normalized_value: normalizedValue,
        },
    });
};

export const updateAttributeValue = async(attributeValueId: string, data: Prisma.attribute_valuesUpdateInput) => {
    return await prisma.attribute_values.update({
        where: {
            attribute_value_id: attributeValueId,
        },
        data,
    });
};

export const deleteAttributeValue = async(attributeValueId: string) => {
    return await prisma.attribute_values.delete({
        where: {
            attribute_value_id: attributeValueId,
        },
    });
};
