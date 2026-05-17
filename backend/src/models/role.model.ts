import prisma from "#config/prisma"
import AppError from "#utils/AppError";
import { Prisma } from "@prisma/client";

//Hàm tìm role theo role_name
export const findByRoleNameByRoleName = async(roleName: string) => {
    return await prisma.roles.findUnique({
        where: {
            role_name: roleName,
        }
    });
}

//Hàm tạo role
export const createRoleByRoleName = async(roleName: string, description: string) => {
    return await prisma.roles.create({
        data: {
            role_name: roleName,
            description: description,
        },
        select: {
            role_name: true,
            description: true,
        }
    });
};

//Hàm xóa role
export const deleteRoleByRoleName = async(roleName: string) => {

    const isUsedRole = await prisma.users_roles.findFirst({
        where: {
            role_name: roleName,
        }
    });

    if(isUsedRole) throw new AppError(`Role ${roleName} này đang được user sử dụng không thể xóa`, 409);

    return await prisma.roles.delete({
        where: {
            role_name: roleName
        },
        select: {
            role_name: true,
            description: true,
        },
    });
};

//Hàm lấy tất cả role
export const findAllRoles = async() => {
    return await prisma.roles.findMany({
        select: {
            role_name: true,
            description: true,
        },
    });
};

