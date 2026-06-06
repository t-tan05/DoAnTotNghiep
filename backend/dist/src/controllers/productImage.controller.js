import { addVariantImagesService, deleteProductImageService, setDefaultProductImageService } from "#services/productImage.service";
import { CatchAsync } from "#utils/CatchAsync";
export const addVariantImageController = CatchAsync(async (req, res) => {
    const variantId = req.params.variantId;
    const files = req.files;
    const data = await addVariantImagesService(variantId, files);
    res.status(201).json({
        success: true,
        message: "Thêm ảnh cho biến thể thành công",
        data: {
            ...data,
        },
    });
});
export const deleteProductImageController = CatchAsync(async (req, res) => {
    const imageId = req.params.imageId;
    const parseData = Number.parseInt(imageId);
    const data = await deleteProductImageService(parseData);
    res.status(200).json({
        success: true,
        message: "Xóa ảnh sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const setDefaultProductImageController = CatchAsync(async (req, res) => {
    const imageId = req.params.imageId;
    const parseData = Number.parseInt(imageId);
    const data = await setDefaultProductImageService(parseData);
    res.status(200).json({
        success: true,
        message: "Đặt ảnh mặc định thành công",
        data: {
            ...data,
        },
    });
});
