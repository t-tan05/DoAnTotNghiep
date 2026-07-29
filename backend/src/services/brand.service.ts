import { 
    createBrand, 
    deleteBrandById, 
    findBrandById, 
    findBrandByNormalizeName, 
    updateBrand, 
    BrandSortBy, 
    getBrandsWithQuery, 
    getBrandDeleteUsage
} from "#models/brand.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
import { ListQuery } from "#types/pagination.type";
import { buildDeleteBlockedMessage } from "#utils/deleteGuard";

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

export const getAllBrandsService = async(params: ListQuery<BrandSortBy>) => {
    const {brands, totalItems} = await getBrandsWithQuery(params);

    return {
        brands,
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
        },
    };
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

    const usage = await getBrandDeleteUsage(brandId);

    const message = buildDeleteBlockedMessage("thương hiệu", [
        { label: "sản phẩm", count: usage.productCount },
        { label: "dòng sản phẩm", count: usage.productLineCount },
        { label: "trang CMS", count: usage.cmsCollectionCount },
        { label: "rule CMS", count: usage.cmsRuleCount },
    ]);

    if(message) throw new AppError(message, 409);

    const delBrand = await deleteBrandById(brandId);

    return {delBrand};
}