import rateLimit from "express-rate-limit";
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.",
});
export const rateRequestSendResetCode = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.",
});
export const changePasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 15,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau."
});
