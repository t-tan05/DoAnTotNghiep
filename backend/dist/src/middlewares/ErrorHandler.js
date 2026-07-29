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
    if (err.code === "P2003") {
        return res.status(409).json({
            status: "fail",
            message: "Không thể xóa dữ liệu vì đang được sử dụng ở nơi khác.",
        });
    }
    if (err.code === "P2025") {
        return res.status(404).json({
            status: "fail",
            message: "Không tìm thấy dữ liệu cần thao tác.",
        });
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || "Internal Server Error",
    });
};
