import prisma from "#config/prisma";
import { Prisma } from "@prisma/client";

export const createProductImageTransaction = async(
    tx: Prisma.TransactionClient, 
    data: Prisma.product_imagesUncheckedCreateInput[],
) => {
    return await tx.product_images.createMany({
        data,
    });
};

export const findProductImgaeById = async(imageId: number) => {
    return await prisma.product_images.findUnique({
        where: {
            image_id: imageId,
        },
    });
};

export const createProductImages = async(
    data: Prisma.product_imagesUncheckedCreateInput[]
) => {
    return await prisma.product_images.createMany({
        data,
    });
};

export const deleteProductImage = async(imageId: number) => {
    return await prisma.product_images.delete({
        where: {
            image_id: imageId
        }
    });
};

export const setDefaultProductImage = async(imageId: number, variantId: string) => {
    return await prisma.$transaction(async(tx) => {
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
