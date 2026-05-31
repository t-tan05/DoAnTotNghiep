import { 
    forgotPasswordService, 
    loginService, 
    logoutService, 
    refreshTokenService, 
    registerService, 
    resendVerifyEmailService, 
    resetPasswordService, 
    verifyEmailService, 
    verifyResetCodeService 
} from "#services/auth.service";
import AppError from "#utils/AppError";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

export const loginController = CatchAsync(async(req: Request, res: Response) => {
    const {email, password} = req.body;

    const data = await loginService(email, password);

    res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
            ...data,
        }
    });
});

export const registerController = CatchAsync(async(req: Request, res: Response) => {
    const {name, email, password, confirmPassword} = req.body;

    const data = await registerService(name, email, password, confirmPassword);

    res.status(201).json({
        success: true,
        message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản",
        data: {
            ...data,
        }
    });
});

export const verifyEmailController = CatchAsync(async(req: Request, res: Response) => {
    const {email, verifyToken} = req.body;

    await verifyEmailService(email, verifyToken);

    res.status(200).json({
        success: true,
        message: "Xác thực email thành công",
    })
});


export const resendVerifyEmailController = CatchAsync(async(req: Request, res: Response) => {
    const {email} = req.body;

    await resendVerifyEmailService(email);

    res.status(200).json({
        success: true,
        message: "Gửi lại mã xác thực thành công",
    });
});

export const forgotPasswordController = CatchAsync(async(req: Request, res: Response) => {
    const {email} = req.body;

    await forgotPasswordService(email);

    res.status(200).json({
        success: true,
        message: "Mã xác nhận đổi mật khẩu đã được gửi về email. Vui lòng kiểm tra email của bạn",
    });
});

export const verifyResetCodeController = CatchAsync(async(req: Request, res: Response) => {
    const {email, resetCode} = req.body;

    if(await verifyResetCodeService(email, resetCode)){
        res.status(200).json({
            success: true,
            message: "Mã xác nhận hợp lệ",
        })
    }
});

export const resetPasswordController = CatchAsync(async(req: Request, res: Response) => {
    const {email, resetCode, newPassword, confirmPassword} = req.body;

    await resetPasswordService(email, resetCode, newPassword, confirmPassword);

    res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công",
    });
});

export const refreshTokenController = CatchAsync(async(req: Request, res: Response) => {
    const {refreshToken} = req.body;

    const data = await refreshTokenService(refreshToken);

    res.status(200).json({
        success: true,
        message: "Làm mới token thành công",
        data: {
            ...data,
        }
    });
});

export const logoutController = CatchAsync(async(req: AuthRequest, res: Response) => {
    const userId = req.user.user_id;
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) throw new AppError("Bạn chưa đăng nhập", 401);

    const token = authHeader.split(" ")[1];

    await logoutService(userId, token);

    res.status(200).json({
        success: true,
        message: "Logout thành công",
    });
});

