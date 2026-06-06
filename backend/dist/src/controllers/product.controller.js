import { createProductService, getAllProductsService, getProductDetailService, updateProductService } from "#services/product.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createProductController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const files = req.files ?? [];
    const data = await createProductService(req.body, files, userId);
    res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const getProductDetailController = CatchAsync(async (req, res) => {
    const productId = req.params?.productId;
    const data = await getProductDetailService(productId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const getAllProductsController = CatchAsync(async (req, res) => {
    const data = await getAllProductsService();
    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const updateProductController = CatchAsync(async (req, res) => {
    const productId = req.params?.productId;
    const data = await updateProductService(productId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
