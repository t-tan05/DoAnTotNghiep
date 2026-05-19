import { createCategory, findCategoryById, findCategoryByNormalizeName, getAllCategories, updateCategory } from "#models/category.models";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";

export const createCategoryService = async(categoryName: string, description?: string) => {
    //Tên hiển thị
    const displayName = categoryName.trim();

    //Tên chuẩn hóa để kiểm tra sự duplicate
    const normalizeName = normalizeText(categoryName);

    const existedCategory = await findCategoryByNormalizeName(normalizeName);

    if(existedCategory) throw new AppError("Danh mục đã tồn tại", 409);

    const categoryId = crypto.randomUUID();

    const newCategory = await createCategory(categoryId, displayName, normalizeName, description);

    return {newCategory};
};

export const getAllCategoriesService = async() => {
    const categories = await getAllCategories();

    return {categories};
};

export const getCategoryByIdService = async(categoryId: string) => {
    const category = await findCategoryById(categoryId);

    if(!category) throw new AppError("Không tìm thấy danh mục", 404);

    return {category};
};

export const updateCategoryService = async(categoryId: string, categoryName: string, description?: string) => {
    const category = await findCategoryById(categoryId);

    if(!category) throw new AppError("Không tìm thấy danh mục", 404);

    const displayName = categoryName.trim();

    const normalizeName = normalizeText(categoryName);

    const existedCategory = await findCategoryByNormalizeName(normalizeName);

    if(existedCategory && category.category_id !== categoryId) throw new AppError("Tên danh mục đã tồn tại", 409);

    const updCategory = await updateCategory(categoryId, {
        category_name: displayName,
        normalized_name: normalizeName,
        description
    });

    return {updCategory};
};

