import cloudinary from "#config/cloudinary";
import AppError from "./AppError.js";

export const uploadImageToCloudinary = async(file: Express.Multer.File, folder: string) => {
    if(!file) throw new AppError("Không tìm thấy file ảnh", 400);

    return new Promise<{
        secure_url: string;
        public_id: string
    }>((resole, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if(error || !result) {
                    return reject(new AppError("Upload ảnh thất bại", 500));
                }

                resole({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        //giải phóng bộ nhớ đệm
        stream.end(file.buffer);
    });
};

export const deleteImageFromCloudinary = async(publicId?: string | null) => {
    if(!publicId) return;

    await cloudinary.uploader.destroy(publicId);
};