import prisma from "#config/prisma";
export const createProductImageTransaction = async (tx, data) => {
    return await tx.product_images.createMany({
        data,
    });
};
export const findProductImgaeById = async (imageId) => {
    return await prisma.product_images.findUnique({
        where: {
            image_id: imageId,
        },
    });
};
export const createProductImages = async (data) => {
    return await prisma.product_images.createMany({
        data,
    });
};
export const deleteProductImage = async (imageId) => {
    return await prisma.product_images.delete({
        where: {
            image_id: imageId
        }
    });
};
export const setDefaultProductImage = async (imageId, variantId) => {
    return await prisma.$transaction(async (tx) => {
        await tx.product_images.updateMany({
            where: {
                variant_id: variantId,
            },
            data: {
                is_default: false
            }
        });
        const image = await tx.product_images.update({
            where: {
                image_id: imageId,
            },
            data: {
                is_default: true,
            }
        });
        return image;
    });
};
