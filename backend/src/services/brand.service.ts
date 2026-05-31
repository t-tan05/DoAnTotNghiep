import { createBrand, deleteBrandById, findBrandById, findBrandByNormalizeName, getAllBrand, updateBrand } from "#models/brand.model";
import { findProductByBrandId } from "#models/product.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";

export const createBrandService = async(brandName: string, description?: string) => {
    const displayName = brandName.trim();

    //Tên chuẩn hóa để kiểm tra sự duplicate
    const normalizeName = normalizeText(displayName);

    const existedBrand = await findBrandByNormalizeName(normalizeName);

    if(existedBrand) throw new AppError("Thương hiệu sản phẩm đã tồn tại", 409);

    const brandId = crypto.randomUUID();

    const newBrand = await createBrand(brandId, displayName, normalizeName, description);

    return {newBrand};
}

export const getAllBrandsService = async() => {
    const brands = await getAllBrand();

    return {brands};
};

export const getBrandByIdService = async(brandId: string) => {
    const brand = await findBrandById(brandId);

    if(!brand) throw new AppError("Không tìm thấy thương hiệu sản phẩm", 404);

    return {brand};
};

export const updateBrandService = async(brandId: string, brandName: string, description?: string) => {
    const brand = await findBrandById(brandId);

    if(!brand) throw new AppError("Không tìm thấy thương hiệu sản phẩm", 404);

    const displayName = brandName.trim();

    const normalizeName = normalizeText(displayName);

    const existedBrand = await findBrandByNormalizeName(normalizeName);

    if(existedBrand && existedBrand.brand_id !== brandId) throw new AppError("Tên thương hiệu sản phẩm đã tồn tại", 409);

    const updBrand = await updateBrand(brandId, {
        brand_name: displayName,
        normalized_name: normalizeName,
        description,
    });

    return {updBrand};
}

export const deleteBrandService = async(brandId: string) => {
    const brand = await findBrandById(brandId);

    if(!brand) throw new AppError("Không tìm thấy thương hiệu sản phẩm", 404);

    const existedBrandInProduct = await findProductByBrandId(brandId);

    if(existedBrandInProduct) throw new AppError("Không thể xóa vì thương hiệu sản phẩm đang được sử dụng", 409);

    const delBrand = await deleteBrandById(brandId);

    return {delBrand};
}