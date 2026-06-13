import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";

export const findProductAttributesByNormalizedNames = async(normalizedNames: string[]) => {
    return await prisma.product_attributes.findMany({
        where: {
            normalized_name: {
                in: normalizedNames,
            },
        },
    });
};

export const findProductAttributeByNormalizedName = async(normalizedName: string) => {
    return await prisma.product_attributes.findUnique({
        where: {
            normalized_name: normalizedName
        },
    });
};

export const findProductAttributeById = async(attributeId: string) => {
    return await prisma.product_attributes.findUnique({
        where: {
            attribute_id: attributeId,
        },
        include: {
            attribute_values: true,
        }
    });
};

export const createProductAttributes = async(data: Prisma.product_attributesUncheckedCreateInput[]) => {
    return await prisma.product_attributes.createMany({
        data,
    });
};

export const findAllProductAttribute = async() => {
    return await prisma.product_attributes.findMany({
        include: {
            attribute_values: {
                orderBy: {
                    display_order: "asc",
                },
            },
        },
        orderBy: {
            display_order: "asc"
        },
    });
};


export const updateProductAttribute = async(attributeId: string, data: Prisma.product_attributesUpdateInput) => {
    return await prisma.product_attributes.update({
        where: {
            attribute_id: attributeId,
        },
        data,
    });
};

export const deleteProductAttribute = async(attributeId: string) => {
    return await prisma.product_attributes.delete({
        where: {
            attribute_id: attributeId,
        },
    });
};