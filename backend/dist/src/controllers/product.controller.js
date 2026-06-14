import { createProductService, deleteProductService, getAllProductsService, getProductDetailService, updateProductService } from "#services/product.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
export const createProductController = CatchAsync(async (req, res) => {
    const data = await createProductService(req.body);
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
    const query = {
        ...parseListQuery({
            query: req.query,
            allowedSortFields: ["product_name", "created_at", "warranty_period"],
            defaultSortBy: "created_at",
        }),
        brandId: typeof req.query.brandId === "string" ? req.query.brandId : undefined,
        categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
    };
    const data = await getAllProductsService(query);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const deleteProductController = CatchAsync(async (req, res) => {
    const productId = req.params.productId;
    const data = await deleteProductService(productId);
    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: {
            ...data,
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
