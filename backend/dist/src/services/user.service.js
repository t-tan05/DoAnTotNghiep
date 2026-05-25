import { getAllUsers, findUserById, updateUserById, deleteUserById } from "#models/user.model";
import AppError from "#utils/AppError";
//Hàm lấy tất cả tài khoản dành cho ADMIN
export const getAllUsersService = async () => {
    const users = await getAllUsers();
    return { users };
};
//Hàm lấy thông tin cá nhân
export const profileService = async (userId) => {
    const user = await findUserById(userId);
    if (!user)
        throw new AppError("Không tìm thấy người dùng", 404);
    return {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        roles: user.users_roles.map((role) => role.role_name),
    };
};
//Hàm cập nhật thông tin cá nhân
export const updateProfileService = async (userId, name) => {
    const user = await findUserById(userId);
    if (!user)
        throw new AppError("Không tìm thấy người dùng", 404);
    const upUser = await updateUserById(user.user_id, { name });
    return { upUser };
};
//Hàm khóa tài khoản dành cho ADMIN
export const lockUserService = async (userId, reason) => {
    const existedUser = await findUserById(userId);
    if (!existedUser)
        throw new AppError("Người dùng không tồn tại", 404);
    if (existedUser.status === "LOCKED")
        throw new AppError("Tài khoản này đã bị khóa trước đó", 409);
    const lockUser = await updateUserById(existedUser.user_id, {
        status: "LOCKED",
        locked_reason: reason,
        locked_at: new Date(),
    });
    return { lockUser };
};
//Hàm mở khóa tài khoản dành cho ADMIN
export const unlockUserService = async (userId) => {
    const existedUser = await findUserById(userId);
    if (!existedUser)
        throw new AppError("Người dùng không tồn tại", 404);
    if (existedUser.status === "ACTIVE")
        throw new AppError("Tài khoản này chưa bị khóa", 409);
    const unlockUser = await updateUserById(existedUser.user_id, {
        status: "ACTIVE",
        locked_reason: null,
        locked_at: null,
    });
    return { unlockUser };
};
//Hàm xóa tài khoản user
export const delUserService = async (userId) => {
    const existedUser = await findUserById(userId);
    if (!existedUser)
        throw new AppError("Người dùng không tồn tại", 404);
    await deleteUserById(existedUser.user_id);
};
