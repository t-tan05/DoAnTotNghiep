import redisClient from "#config/redis";
import { getAllUsers, findUserById, updateUserById, deleteUserById, findUserByIdForChangePassword } from "#models/user.model";
import AppError from "#utils/AppError";
import bcrypt from "bcrypt";
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
//Hàm cập nhật mật khẩu của user
export const updatePasswordService = async (userId, currentPassword, newPassword, confirmPassword) => {
    const user = await findUserByIdForChangePassword(userId);
    if (!user)
        throw new AppError("Người dùng không tồn tại", 404);
    const isOldPasswordCorrect = await bcrypt.compare(currentPassword, user.pass_word);
    //Tạo redis key
    const key = `update-password:${userId}`;
    //Lấy số lần nhập mật khẩu thất bại
    const attemptsStr = await redisClient.get(key);
    //Parse attemptsStr từ String sang Int
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;
    //Kiểm tra attempts nếu >= 5 sẽ khóa tài khoản
    if (attempts >= 5) {
        throw new AppError(`Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.`, 400);
    }
    if (!isOldPasswordCorrect) {
        const newAttempts = await redisClient.incr(key);
        if (newAttempts === 1) {
            await redisClient.expire(key, 900); //hiệu lực trong 15 phút
        }
        throw new AppError("Mật khẩu hiện tại không đúng.", 400);
    }
    await redisClient.del(key);
    if (newPassword !== confirmPassword)
        throw new AppError("Mật khẩu xác nhận không khớp.", 400);
    const existedPassword = await bcrypt.compare(newPassword, user.pass_word);
    if (existedPassword)
        throw new AppError("Mật khẩu mới không được trùng với mật khẩu cũ.", 409);
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await updateUserById(userId, {
        pass_word: hashPassword,
    });
    return true;
};
