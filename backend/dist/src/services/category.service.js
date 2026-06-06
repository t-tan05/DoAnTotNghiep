import { createCategory, deleteCategoryById, findCategoryById, findCategoryByNormalizeName, getAllCategories, updateCategory } from "#models/category.model";
import { findProductByCategoryId } from "#models/product.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
export const createCategoryService = async (categoryName, description) => {
    //Tên hiển thị
    const displayName = categoryName.trim();
    //Tên chuẩn hóa để kiểm tra sự duplicate
    const normalizeName = normalizeText(categoryName);
    const existedCategory = await findCategoryByNormalizeName(normalizeName);
    if (existedCategory)
        throw new AppError("Danh mục sản phẩm đã tồn tại", 409);
    const categoryId = crypto.randomUUID();
    const newCategory = await createCategory(categoryId, displayName, normalizeName, description);
    return { newCategory };
};
export const getAllCategoriesService = async () => {
    const categories = await getAllCategories();
    return { categories };
};
export const getCategoryByIdService = async (categoryId) => {
    const category = await findCategoryById(categoryId);
    if (!category)
        throw new AppError("Không tìm thấy danh mục sản phẩm", 404);
    return { category };
};
export const updateCategoryService = async (categoryId, categoryName, description) => {
    const category = await findCategoryById(categoryId);
    if (!category)
        throw new AppError("Không tìm thấy danh mục sản phẩm", 404);
    const displayName = categoryName.trim();
    const normalizeName = normalizeText(categoryName);
    const existedCategory = await findCategoryByNormalizeName(normalizeName);
    if (existedCategory && existedCategory.category_id !== categoryId)
        throw new AppError("Tên danh mục sản phẩm đã tồn tại", 409);
    const updCategory = await updateCategory(categoryId, {
        category_name: displayName,
        normalized_name: normalizeName,
        description
    });
    return { updCategory };
};
export const deleteCategoryService = async (categoryId) => {
    const category = await findCategoryById(categoryId);
    if (!category)
        throw new AppError("Không tìm thấy danh mục sản phẩm", 404);
    const existedCategoryInProduct = await findProductByCategoryId(categoryId);
    if (existedCategoryInProduct)
        throw new AppError("Không thể xóa vì danh mục sản phẩm này đang được sử dụng", 409);
    const delCategory = await deleteCategoryById(categoryId);
    return { delCategory };
};
