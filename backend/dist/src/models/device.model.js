export const createDevicesTransaction = async (tx, data) => {
    if (data.length === 0)
        return;
    return await tx.devices.createMany({
        data,
    });
};
export const findAvailabelDevicesByVariantId = async (tx, variantId, quantity) => {
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
