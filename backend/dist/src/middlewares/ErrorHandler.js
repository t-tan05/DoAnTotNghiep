export const globalErrorHandler = (err, req, res, next) => {
    //Token hết hạn
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: "fail",
            message: "Token đã hết hạn",
        });
    }
    //Token không hợp lệ
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            status: "fail",
            message: "Token không hợp lệ",
        });
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || "Internal Server Error",
    });
};
