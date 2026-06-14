import prisma from "#config/prisma";
export const findProductAttributesByNormalizedNames = async (normalizedNames) => {
    return await prisma.product_attributes.findMany({
        where: {
            normalized_name: {
                in: normalizedNames,
            },
        },
    });
};
export const findProductAttributeByNormalizedName = async (normalizedName) => {
    return await prisma.product_attributes.findUnique({
        where: {
            normalized_name: normalizedName
        },
    });
};
export const findProductAttributeById = async (attributeId) => {
    return await prisma.product_attributes.findUnique({
        where: {
            attribute_id: attributeId,
        },
        include: {
            attribute_values: true,
        }
    });
};
export const createProductAttributes = async (data) => {
    return await prisma.product_attributes.createMany({
        data,
    });
};
export const findAllProductAttribute = async () => {
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
export const updateProductAttribute = async (attributeId, data) => {
    return await prisma.product_attributes.update({
        where: {
            attribute_id: attributeId,
        },
        data,
    });
};
export const deleteProductAttribute = async (attributeId) => {
    return await prisma.product_attributes.delete({
        where: {
            attribute_id: attributeId,
        },
    });
};
