import prisma from "#config/prisma";
export const findDefaultAddressByUserId = async (userId) => {
    return await prisma.addresses.findFirst({
        where: {
            user_id: userId,
            is_default: true
        },
    });
};
export const createAddress = async (data) => {
    return await prisma.addresses.create({ data });
};
export const createDefaultAddressByTransaction = async (data) => {
    return await prisma.$transaction(async (tx) => {
        await tx.addresses.updateMany({
            where: {
                user_id: data.user_id,
                is_default: true,
            },
            data: {
                is_default: false,
            },
        });
        return await tx.addresses.create({
            data: {
                ...data,
                is_default: true,
            },
        });
    });
    ;
};
export const getAllAddressesByUserId = async (userId) => {
    return await prisma.addresses.findMany({
        where: {
            user_id: userId,
        },
        orderBy: {
            is_default: "desc",
        }
    });
};
export const findAddressByIdAndUserId = async (addressId, userId) => {
    return await prisma.addresses.findFirst({
        where: {
            address_id: addressId,
            user_id: userId,
        },
    });
};
export const updateAddressByTransaction = async (userId, addressId, data, isDefault) => {
    return await prisma.$transaction(async (tx) => {
        if (isDefault) {
            await tx.addresses.updateMany({
                where: {
                    user_id: userId,
                    is_default: true,
                },
                data: {
                    is_default: false,
                },
            });
        }
        return await tx.addresses.update({
            where: {
                address_id: addressId,
            },
            data: {
                ...data,
                is_default: isDefault
            }
        });
    });
};
export const countAddressByUserId = async (userId) => {
    return await prisma.addresses.count({
        where: {
            user_id: userId,
        },
    });
};
export const deleteAddressById = async (addressId) => {
    return await prisma.addresses.delete({
        where: {
            address_id: addressId,
        },
    });
};
