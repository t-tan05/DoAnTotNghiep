import { createBrandService, getAllBrandsService, getBrandByIdService, updateBrandService } from "#services/brand.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createBrandController = CatchAsync(async (req, res) => {
    const { brandName, description } = req.body;
    const data = await createBrandService(brandName, description);
    res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công",
        ...data,
    });
});
export const getAllBrandsController = CatchAsync(async (req, res) => {
    const data = await getAllBrandsService();
    res.status(200).json({
        success: true,
        message: "Danh sách thương hiệu",
        data: {
            ...data,
        },
    });
});
export const getBrandByIdController = CatchAsync(async (req, res) => {
    const brandId = req.params.brandId;
    const data = await getBrandByIdService(brandId);
    res.status(200).json({
        success: true,
        message: "Tìm thương hiệu thành công",
        ...data,
    });
});
export const updateBrandController = CatchAsync(async (req, res) => {
    const brandId = req.params.brandId;
    const { brandName, description } = req.body;
    const data = await updateBrandService(brandId, brandName, description);
    res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        ...data,
    });
});
