import { Prisma } from "@prisma/client";

export const createDevicesTransaction = async(
    tx: Prisma.TransactionClient,
    data: Prisma.devicesUncheckedCreateInput[],
) => {
    if(data.length === 0) return;

    return await tx.devices.createMany({
        data,
    });
};

export const findAvailabelDevicesByVariantId = async(
    tx: Prisma.TransactionClient,
    variantId: string,
    quantity: number,
) => {
    return await tx.devices.findMany({
        where: {
            variant_id: variantId,
            status: "AVAILABLE",
        },
        take: quantity,
        orderBy: {
            device_id: "asc",
        },
    });
};

