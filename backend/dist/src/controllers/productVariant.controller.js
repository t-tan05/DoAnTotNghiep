import { createProductVariantService, deleteProductVariantService, getProductVariantService, updateProductVariantService } from "#services/productVariant.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createProductVariantController = CatchAsync(async (req, res) => {
    const productId = req.params?.productId;
    const userId = req.user.user_id;
    const files = req.files ?? [];
    const data = await createProductVariantService(productId, req.body, files, userId);
    res.status(201).json({
        success: true,
        message: "Tạo biến thể sản phẩm thành công",
        data: {
            ...data
        }
    });
});
export const updateProductVariantController = CatchAsync(async (req, res) => {
    const variantId = req.params.variantId;
    const userId = req.user?.user_id;
    const data = await updateProductVariantService(variantId, req.body, userId);
    res.status(200).json({
        success: true,
        message: "Cập nhật biến thể sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const getProductVariantController = CatchAsync(async (req, res) => {
    const variantId = req.params.variantId;
    const data = await getProductVariantService(variantId);
    res.status(200).json({
        success: true,
        message: "Lấy biến thể sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const deleteProductVariantController = CatchAsync(async (req, res) => {
    const variantId = req.params.variantId;
    const data = await deleteProductVariantService(variantId);
    res.status(200).json({
        success: true,
        message: "Xóa biến thể sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
