import { findBrandById } from "#models/brand.model";
import { findCategoryById } from "#models/category.model";
import { createProductLine, deleteProductLineById, findProductLineById, findProductLineByScopeSlug, getProductLinesWithQuery, updateProductLine, } from "#models/productLine.model";
import AppError from "#utils/AppError";
import { createSlug } from "#utils/createSlug";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
const buildLineSlug = (lineName) => createSlug(lineName.trim());
const ensureBrandAndCategory = async (brandId, categoryId) => {
    const [brand, category] = await Promise.all([
        findBrandById(brandId),
        findCategoryById(categoryId),
    ]);
    if (!brand) {
        throw new AppError("Không tìm thấy thương hiệu.", 404);
    }
    if (!category) {
        throw new AppError("Không tìm thấy danh mục.", 404);
    }
};
const ensureUniqueProductLine = async ({ lineId, brandId, categoryId, slug, }) => {
    const existedLine = await findProductLineByScopeSlug({
        brandId,
        categoryId,
        slug,
    });
    if (existedLine && existedLine.line_id !== lineId) {
        throw new AppError("Dòng sản phẩm đã tồn tại trong thương hiệu và danh mục này.", 409);
    }
};
export const createProductLineService = async (data) => {
    const displayName = data.lineName.trim();
    const normalizedName = normalizeText(displayName);
    const slug = buildLineSlug(displayName);
    await ensureBrandAndCategory(data.brandId, data.categoryId);
    await ensureUniqueProductLine({
        brandId: data.brandId,
        categoryId: data.categoryId,
        slug,
    });
    const productLine = await createProductLine({
        line_id: crypto.randomUUID(),
        line_name: displayName,
        normalized_name: normalizedName,
        slug,
        brand_id: data.brandId,
        category_id: data.categoryId,
        description: data.description?.trim() || null,
        image_url: data.imageUrl?.trim() || null,
        display_order: data.displayOrder ?? 0,
        is_active: data.isActive ?? true,
    });
    return { productLine };
};
export const getAllProductLinesService = async (params) => {
    const { productLines, totalItems } = await getProductLinesWithQuery(params);
    return {
        productLines,
        meta: {
            pagination: {
                page: params.page,
                limit: params.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / params.limit),
            },
            sort: {
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            },
            search: params.search,
            filters: {
                brandId: params.brandId,
                categoryId: params.categoryId,
                isActive: params.isActive,
            },
        },
    };
};
export const getProductLineByIdService = async (lineId) => {
    const productLine = await findProductLineById(lineId);
    if (!productLine) {
        throw new AppError("Không tìm thấy dòng sản phẩm.", 404);
    }
    return { productLine };
};
export const updateProductLineService = async (lineId, data) => {
    const productLine = await findProductLineById(lineId);
    if (!productLine) {
        throw new AppError("Không tìm thấy dòng sản phẩm.", 404);
    }
    const nextBrandId = data.brandId ?? productLine.brand_id;
    const nextCategoryId = data.categoryId ?? productLine.category_id;
    const nextLineName = data.lineName?.trim() || productLine.line_name;
    const nextSlug = buildLineSlug(nextLineName);
    if (data.brandId !== undefined || data.categoryId !== undefined) {
        await ensureBrandAndCategory(nextBrandId, nextCategoryId);
    }
    if (data.lineName !== undefined
        || data.brandId !== undefined
        || data.categoryId !== undefined) {
        await ensureUniqueProductLine({
            lineId,
            brandId: nextBrandId,
            categoryId: nextCategoryId,
            slug: nextSlug,
        });
    }
    const updateData = {};
    if (data.lineName !== undefined) {
        updateData.line_name = nextLineName;
        updateData.normalized_name = normalizeText(nextLineName);
        updateData.slug = nextSlug;
    }
    if (data.brandId !== undefined)
        updateData.brand_id = data.brandId;
    if (data.categoryId !== undefined)
        updateData.category_id = data.categoryId;
    if (data.description !== undefined)
        updateData.description = data.description?.trim() || null;
    if (data.imageUrl !== undefined)
        updateData.image_url = data.imageUrl?.trim() || null;
    if (data.displayOrder !== undefined)
        updateData.display_order = data.displayOrder;
    if (data.isActive !== undefined)
        updateData.is_active = data.isActive;
    const updatedProductLine = await updateProductLine(lineId, updateData);
    return { productLine: updatedProductLine };
};
export const deleteProductLineService = async (lineId) => {
    const productLine = await findProductLineById(lineId);
    if (!productLine) {
        throw new AppError("Không tìm thấy dòng sản phẩm.", 404);
    }
    if (productLine._count.products > 0) {
        throw new AppError("Không thể xóa vì dòng sản phẩm đang được sản phẩm sử dụng.", 409);
    }
    const deletedProductLine = await deleteProductLineById(lineId);
    return { productLine: deletedProductLine };
};
