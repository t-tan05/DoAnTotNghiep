import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const excelUpload = multer({
    storage,
    limits: {
        fieldSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = [".xlsx", ".xls"];

        if(!allowedExts.includes(ext)) {
            return cb(new Error("Chỉ cho phép upload file Excel .xlsx hoặc .xls"));
        }

        cb(null, true);
    },
});