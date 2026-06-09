import prisma from "#config/prisma";
import AppError from "#utils/AppError";
import { Prisma } from "@prisma/client";

export const findUserByEmail = async (email: string) => {
    return await prisma.users.findUnique({
        where: { email },
        include: {
            users_roles: true,
        },
    });
};

export const findUserById = async(userId: string) => {
    return await prisma.users.findUnique({
        where: { user_id: userId },
        select: {
            user_id: true,
            email: true,
            name: true,
            verified: true,
            refreshToken: true,
            status: true,
            users_roles: {
                select: {
                    role_name: true,
                },
            },
        },
    });
};

export const findUserByIdForChangePassword = async(userId: string) => {
    return await prisma.users.findUnique({
        where: {
            user_id: userId,
        },
        select: {
            user_id: true,
            name: true,
            email: true,
            pass_word: true,
            verified: true,
            refreshToken: true,
            status: true,
            users_roles: {
                select: {
                    role_name: true,
                },
            },
        }
    })
}

export const getRolesById = async(userId: string) => {
    return await prisma.users_roles.findMany({
        where: {
            user_id: userId,
        },
        select: {
            role_name: true,
        },
    });
};

export const updateUserById = async(userId: string, data: Prisma.usersUpdateInput) => {
    return await prisma.users.update({
        where: {
            user_id: userId,
        },
        data,
        select: {
            user_id: true,
            email: true,
            name: true,
            verified: true,
            status: true,
        },
    });
};

export const createUserWithRole = async(
    userId: string,
    name: string,
    email: string,
    hashPassword: string,
    hashVerifyToken: string,
    verifyTokenExpire: Date,
    roleName: string
) => {
    return await prisma.$transaction(async(tx) => {
        const role = await tx.roles.findUnique({
            where: {
                role_name: roleName,
            },
        });

        if(!role) throw new AppError(`Role ${roleName} không tồn tại`, 404);

        const newUser = await prisma.users.create({
            data: {
                user_id: userId,
                email,
                pass_word: hashPassword,
                name,
                verified: false,
                verify_token: hashVerifyToken,
                verify_token_expire: verifyTokenExpire,
            },
            select: {
                user_id: true,
                email: true,
                name: true,
                verified: true,
                status: true,
            },
        });

        await tx.users_roles.create({
            data: {
                user_id: userId,
                role_name: role.role_name,
            },
        });

        return newUser;
    });
};

export const getAllUsers = async() => {
    return await prisma.users.findMany({
        select: {
            user_id: true,
            email: true,
            name: true,
            verified: true,
            status: true,
            users_roles: {
                select: {
                    role_name: true,
                }
            },
        },
    });
};

export const deleteUserById = async(userId: string)  => {
    return await prisma.users.delete({
        where: {
            user_id: userId,
        }
    });
};