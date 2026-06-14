import { createCategoryService, deleteCategoryService, getAllCategoriesService, getCategoryByIdService, updateCategoryService } from "#services/category.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
export const createCategoryController = CatchAsync(async (req, res) => {
    const { categoryName, description } = req.body;
    const data = await createCategoryService(categoryName, description);
    res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: {
            ...data,
        }
    });
});
export const getAllCategoriesController = CatchAsync(async (req, res) => {
    const query = parseListQuery({
        query: req.query,
        allowedSortFields: ["category_name"],
        defaultSortBy: "category_name",
    });
    const data = await getAllCategoriesService(query);
    res.status(200).json({
        success: true,
        message: "Danh sách danh mục",
        data: {
            ...data,
        },
    });
});
export const getCategoryByIdController = CatchAsync(async (req, res) => {
    const categoryId = req.params.categoryId;
    const data = await getCategoryByIdService(categoryId);
    res.status(200).json({
        success: true,
        message: "Tìm danh mục thành công",
        data: {
            ...data,
        }
    });
});
export const updateCategoryController = CatchAsync(async (req, res) => {
    const categoryId = req.params.categoryId;
    const { categoryName, description } = req.body;
    const data = await updateCategoryService(categoryId, categoryName, description);
    res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: {
            ...data,
        }
    });
});
export const deleteCategoryController = CatchAsync(async (req, res) => {
    const categoryId = req.params.categoryId;
    const data = await deleteCategoryService(categoryId);
    res.status(200).json({
        success: true,
        message: "Xóa danh mục sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
