import prisma from "#config/prisma"

//Hàm tìm role theo role_name
export const findByRoleName = async(roleName: string) => {
    return await prisma.roles.findUnique({
        where: {
            role_name: roleName,
        }
    });
}

//Hàm tạo role
export const createRole = async(roleName: string, description: string) => {
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

