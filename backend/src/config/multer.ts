import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fieldSize: 5 * 1024 * 1024,
        files: 15,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if(!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Chỉ cho phép upload ảnh jpeg, png, webp"));
        }

        cb(null, true);
    },
});