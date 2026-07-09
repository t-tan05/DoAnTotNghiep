import prisma from "#config/prisma";
import AppError from "#utils/AppError";
export const findUserByEmail = async (email) => {
    return await prisma.users.findUnique({
        where: { email },
        include: {
            users_roles: true,
        },
    });
};
export const findUserById = async (userId) => {
    return await prisma.users.findUnique({
        where: { user_id: userId },
        select: {
            user_id: true,
            email: true,
            name: true,
            verified: true,
            must_change_password: true,
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
export const findUserByIdForChangePassword = async (userId) => {
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
            must_change_password: true,
            refreshToken: true,
            status: true,
            users_roles: {
                select: {
                    role_name: true,
                },
            },
        }
    });
};
export const getRolesById = async (userId) => {
    return await prisma.users_roles.findMany({
        where: {
            user_id: userId,
        },
        select: {
            role_name: true,
        },
    });
};
export const updateUserById = async (userId, data) => {
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
            must_change_password: true,
            status: true,
        },
    });
};
export const createEmpByAdmin = async (userId, name, email, hashPassword, roleName) => {
    return await prisma.$transaction(async (tx) => {
        const role = await tx.roles.findUnique({
            where: {
                role_name: roleName,
            },
        });
        if (!role)
            throw new AppError(`Role ${roleName} không tồn tại`, 404);
        const newUser = await prisma.users.create({
            data: {
                user_id: userId,
                email,
                pass_word: hashPassword,
                name,
                verified: true,
                must_change_password: true,
            },
            select: {
                user_id: true,
                email: true,
                name: true,
                verified: true,
                must_change_password: true,
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
export const createUserWithRole = async (userId, name, email, hashPassword, hashVerifyToken, verifyTokenExpire, roleName) => {
    return await prisma.$transaction(async (tx) => {
        const role = await tx.roles.findUnique({
            where: {
                role_name: roleName,
            },
        });
        if (!role)
            throw new AppError(`Role ${roleName} không tồn tại`, 404);
        const newUser = await prisma.users.create({
            data: {
                user_id: userId,
                email,
                pass_word: hashPassword,
                name,
                verified: false,
                must_change_password: false,
                verify_token: hashVerifyToken,
                verify_token_expire: verifyTokenExpire,
            },
            select: {
                user_id: true,
                email: true,
                name: true,
                verified: true,
                must_change_password: true,
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
export const getUsersWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder, role, status, verified, mustChangePassword, } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(search ? {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { user_id: { contains: search } },
            ],
        } : {}),
        ...(status ? { status } : {}),
        ...(verified !== undefined ? { verified } : {}),
        ...(mustChangePassword !== undefined ? { must_change_password: mustChangePassword } : {}),
        ...(role ? {
            users_roles: {
                some: {
                    role_name: role,
                },
            },
        } : {}),
    };
    const [users, totalItems] = await prisma.$transaction([
        prisma.users.findMany({
            where,
            skip,
            take: limit,
            select: {
                user_id: true,
                email: true,
                name: true,
                verified: true,
                must_change_password: true,
                status: true,
                locked_reason: true,
                locked_at: true,
                users_roles: {
                    select: {
                        role_name: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.users.count({ where }),
    ]);
    return {
        users,
        totalItems,
    };
};
export const deleteUserById = async (userId) => {
    return await prisma.users.delete({
        where: {
            user_id: userId,
        }
    });
};
