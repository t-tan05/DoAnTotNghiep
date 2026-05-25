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

