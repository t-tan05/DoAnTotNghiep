import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "#config/jwt";
import { createUserWithRole, findUserByEmail, findUserById, getRolesById, updateUserById } from "#models/user.model";
import AppError from "#utils/AppError";
import redisClient from "#config/redis";
import crypto from "crypto";
import { sendResetPasswordEmail, sendVerifyEmail } from "#services/mail.service";
//Tạo hàm ký accessToken
const signAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN, {
        expiresIn: "5m",
        algorithm: 'HS512'
    });
};
//Tạo hàm ký refreshToken
const signRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN, {
        expiresIn: "3h",
        algorithm: "HS512"
    });
};
//Tạo hàm hash token
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
//Hàm tạo mã xác thực email với 6 ký tự
const generateVerifyCode = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
    }
    return code;
};
export const loginService = async (email, password) => {
    const user = await findUserByEmail(email);
    //Kiểm tra email có trong database không
    if (!user)
        throw new AppError("Email hoặc mật khẩu không đúng", 404);
    //Tạo biến isMatch để so sánh password đã được mã hóa trong ddatabase
    const isMatch = await bcrypt.compare(password, user.pass_word);
    //Tạo redis key
    const key = `login_fail:${email}`;
    //Lấy số lần đã đăng nhập thất bại
    const attemptsStr = await redisClient.get(key);
    //Parse attemptsStr từ String sang Int
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;
    //Kiểm tra attempts nếu >= 5 sẽ khóa tài khoản
    if (attempts >= 5) {
        const ttl = await redisClient.ttl(key);
        const minutes = Math.floor((ttl || 0) / 60);
        const seconds = (ttl || 0) % 60;
        throw new AppError(`Tài khoản bị khóa ${minutes} phút ${seconds} giây`, 429);
    }
    //Kiểm tra nếu isMatch là false sẽ tăng số lần đăng nhập thất bại lên 1 và đồng thời set thời gian hiệu lực của key đó
    if (!isMatch) {
        const newAttempts = await redisClient.incr(key);
        if (newAttempts === 1) {
            await redisClient.expire(key, 900); //hiệu lực trong 15 phút
        }
        throw new AppError(`Sai mật khẩu. Còn ${5 - newAttempts} lần thử`, 404);
    }
    //Đăng nhập thành công thì giải phóng vùng nhớ key đó đi
    await redisClient.del(key);
    //Kiểm tra tài khoản đã xác thực chưa
    if (!user.verified)
        throw new AppError("Vui lòng xác thực tài khoản trước khi đăng nhập", 403);
    //Kiểm tra trạng thái tài khoản
    if (user.status === "LOCKED")
        throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ", 403);
    //Lấy danh sách roles của user
    const roles = await getRolesById(user.user_id);
    //Tạo payload cho token
    const payload = {
        user_id: user.user_id,
        email: user.email,
        roles: roles.map((role) => role.role_name),
        mustChangePassword: Boolean(user.must_change_password),
    };
    //Tạo accessToken
    const accessToken = signAccessToken(payload);
    //Tạo refreshToken
    const refreshToken = signRefreshToken(payload);
    //Mã hóa refreshToken trước khi lưu vào db
    const hashRefreshToken = hashToken(refreshToken);
    //Lưu refreshToken cho user
    await updateUserById(user.user_id, {
        refreshToken: hashRefreshToken
    });
    //Trả về dữ liệu theo dạng object
    return { accessToken, refreshToken, mustChangePassword: Boolean(user.must_change_password) };
};
export const registerService = async (name, email, password, confirmPassword) => {
    const isExisted = await findUserByEmail(email);
    //Kiểm tra xem email đã tồn tại chưa. Nếu tồn tại thì báo lỗi
    if (isExisted)
        throw new AppError("Email đã tồn tại!", 409);
    //So sánh password và confirmPassword có giống nhau không
    if (password !== confirmPassword)
        throw new AppError("Mật khẩu xác nhận không đúng", 400);
    //Mã hóa Password
    const hashPassword = await bcrypt.hash(password, 10);
    //Tạo userId bằng UUID
    const userId = crypto.randomUUID();
    //Tạo mã xác thực cho email
    const verifyToken = generateVerifyCode();
    //Tạo giời gian hiệu lực cho mã xác thực
    const verifyTokenExpire = new Date(Date.now() + 10 * 60 * 1000);
    //mã hóa verifyToken trước khi lưu vào db
    const hashVerifyToken = hashToken(verifyToken);
    //Tạo user mới 
    const user = await createUserWithRole(userId, name, email, hashPassword, hashVerifyToken, verifyTokenExpire, "CUSTOMER");
    //gửi mã OPT đến gmail đăng ký
    await sendVerifyEmail(email, verifyToken);
    return { user };
};
export const verifyEmailService = async (email, verifyToken) => {
    const user = await findUserByEmail(email);
    //mã hóa plaintext để so sánh
    const hashVerifyToken = hashToken(verifyToken);
    //Kiểm tra email có tồn tại không
    if (!user)
        throw new AppError("Email không tồn tại", 404);
    //Kiểm tra tài khoản đã được xác thực chưa
    if (user.verified)
        throw new AppError("Tài khoản đã được xác thực", 409);
    //Kiểm tra mã xác thực và thời gian có hợp lệ không
    if (!user.verify_token || !user.verify_token_expire)
        throw new AppError("Mã xác thực không tồn tại", 400);
    //So sánh mã xác thực có đúng chưa
    if (user.verify_token !== hashVerifyToken)
        throw new AppError("Mã xác thực không đúng", 400);
    //Kiểm tra thời gian của mã xác thực hợp lệ không
    if (user.verify_token_expire < new Date())
        throw new AppError("Mã xác thực đã hết hạn", 400);
    //Cập nhật lại thông tin tài khoản
    await updateUserById(user.user_id, {
        verified: true,
        verify_token: null,
        verify_token_expire: null,
    });
};
export const resendVerifyEmailService = async (email) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw new AppError("Email không tồn tại", 404);
    if (user.verified)
        throw new AppError("Tài khoản này đã được xác thực", 409);
    if (user.verify_token_expire) {
        const lastSendTime = user.verify_token_expire.getTime() - 10 * 60 * 1000;
        const canResendAt = lastSendTime + 60 * 1000;
        if (Date.now() < canResendAt)
            throw new AppError("Vui lòng chờ 60 giây trước khi gửi lại mã", 429);
    }
    const verifyToken = generateVerifyCode();
    const verifyTokenExpire = new Date(Date.now() + 10 * 60 * 1000);
    //mã hóa verifyToken trước khi lưu vào db
    const hashVerifyToken = hashToken(verifyToken);
    await updateUserById(user.user_id, {
        verify_token: hashVerifyToken,
        verify_token_expire: verifyTokenExpire,
    });
    await sendVerifyEmail(email, verifyToken);
};
export const forgotPasswordService = async (email) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw new AppError("Email không tồn tại", 404);
    if (user.status === "LOCKED")
        throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ", 403);
    const resetCode = generateVerifyCode();
    const resetCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
    //Mã hóa resetCode trước khi lưu vào db
    const hashResetCode = hashToken(resetCode);
    await updateUserById(user.user_id, {
        reset_token: hashResetCode,
        reset_token_expire: resetCodeExpire,
    });
    await sendResetPasswordEmail(email, resetCode);
};
export const verifyResetCodeService = async (email, resetCode) => {
    const user = await findUserByEmail(email);
    //mã hóa plaintext trước khi so sánh
    const hashResetCode = hashToken(resetCode);
    if (!user)
        throw new AppError("Email không tồn tại", 404);
    if (!user.reset_token || !user.reset_token_expire)
        throw new AppError("Mã xác nhận không tồn tại", 400);
    if (user.reset_token !== hashResetCode)
        throw new AppError("Mã xác nhận không đúng", 400);
    if (user.reset_token_expire < new Date())
        throw new AppError("Mã xác nhận đã hết hạn", 400);
    return true;
};
export const resetPasswordService = async (email, resetCode, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword)
        throw new AppError("Mật khẩu xác nhận không khớp", 400);
    const user = await findUserByEmail(email);
    //mã hóa plaintext trước khi so sánh
    const hashResetCode = hashToken(resetCode);
    if (!user)
        throw new AppError("Email không tồn tại", 404);
    if (!user.reset_token || !user.reset_token_expire)
        throw new AppError("Mã xác nhận không tồn tại", 400);
    if (user.reset_token !== hashResetCode)
        throw new AppError("Mã xác nhận không đúng", 400);
    if (user.reset_token_expire < new Date())
        throw new AppError("Mã xác nhận đã hết hạn", 400);
    const isSamePassword = await bcrypt.compare(newPassword, user.pass_word);
    if (isSamePassword)
        throw new AppError("Mật khẩu mới không được trùng mật khẩu cũ", 400);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserById(user.user_id, {
        pass_word: hashedPassword,
        reset_token: null,
        reset_token_expire: null,
    });
};
export const refreshTokenService = async (refreshToken) => {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN, {
        algorithms: ["HS512"],
    });
    const user = await findUserById(decoded.user_id);
    if (!user || !user.refreshToken)
        throw new AppError("Refresh token không hợp lệ", 401);
    const hashRefreshToken = hashToken(refreshToken);
    if (user.refreshToken !== hashRefreshToken)
        throw new AppError("Refresh token không hợp lệ", 401);
    const roles = await getRolesById(user.user_id);
    const payload = {
        user_id: user.user_id,
        email: user.email,
        roles: roles.map((role) => role.role_name),
        mustChangePassword: Boolean(user.must_change_password),
    };
    const newAccessToken = signAccessToken(payload);
    return { accessToken: newAccessToken };
};
export const logoutService = async (userId, token) => {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp)
        throw new AppError("Token không hợp lệ", 401);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
        await redisClient.set(`blacklist:${token}`, "true", {
            EX: ttl,
        });
    }
    await updateUserById(userId, {
        refreshToken: null,
    });
};
