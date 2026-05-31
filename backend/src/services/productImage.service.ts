import { createProductImages, deleteProductImage, findProductImgaeById, setDefaultProductImage } from "#models/productImage.model";
import { findProductVariantById } from "#models/productVariant.model"
import AppError from "#utils/AppError";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "#utils/UploadCloud";

export const addVariantImagesService = async(variantId: string, files: Express.Multer.File[]) => {
    const variant = await findProductVariantById(variantId);

    if(!variant) throw new AppError("Không tìm thấy biến thể sản phẩm", 404);

    if(!files || files.length === 0) throw new AppError("Vui lòng chọn ảnh cần tải lên", 400);

    const imageData = [];
    const uploadedPublicIds: string[] = [];

    try{
        for(let i = 0; i < files.length; i++){
            const uploadResult = await uploadImageToCloudinary(
                files[i],
                "DoAnTotNghiep/products"
            );

            uploadedPublicIds.push(uploadResult.public_id);
    
            imageData.push({
                image_id: 0,
                product_id: variant.product_id,
                variant_id: variantId,
                image_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                is_default: false,
            });
        }

        await createProductImages(imageData);
    
        return {imageData};
    }catch(error){
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) => deleteImageFromCloudinary(publicId))
        );

        throw error;
    }

};

export const deleteProductImageService = async(imageId: number) => {
    const image = await findProductImgaeById(imageId);

    if(!image) throw new AppError("Không tìm thấy ảnh sản phẩm", 404);

    if(image.public_id){
        await deleteImageFromCloudinary(image.public_id);
    }

    const delImage = await deleteProductImage(imageId);

    return {delImage};
};

export const setDefaultProductImageService = async(imageId: number) => {
    const image = await findProductImgaeById(imageId);

    if(!image) throw new AppError("Không tìm thấy sản phẩm", 404);

    const defaultImage = await setDefaultProductImage(imageId, image.variant_id as string);

    return {defaultImage};
};