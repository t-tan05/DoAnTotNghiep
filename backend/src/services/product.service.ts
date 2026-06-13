import { findBrandById } from "#models/brand.model";
import { findCategoryById } from "#models/category.model";
import { 
    createProduct, 
    deleteProduct, 
    findProductById, 
    findProductByNormalizeName, 
    getProductWithQuery, 
    ProductListQuery, 
    updateProduct 
} from "#models/product.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import type { CreateProductPayload, UpdateProductPayload } from "#types/product.type";


export const createProductService = async(data: CreateProductPayload) => {

    //tên hiển thị
    const displayName = data.productName.trim();

    //Tên được chuẩn hóa
    const normalizedName = normalizeText(displayName);

    //Kiểm tra tên sản phẩm đã tồn tại chưa
    const existedProduct = await findProductByNormalizeName(normalizedName);
    if(existedProduct) throw new AppError("Tên sản phẩm đã tồn tại", 409);

    const brand = await findBrandById(data.brandId);

    //Kiểm tra brand có tồn tại không
    if(!brand) throw new AppError("Thương hiệu không tồn tại", 404);

    const category = await findCategoryById(data.categoryId);

    //Kiểm tra category có tồn tại không
    if(!category) throw new AppError("Danh mục không tồn tại", 404);

    const productId = crypto.randomUUID();

    const newProduct = await createProduct({
        product_id: productId,
        product_name: displayName,
        normalized_name: normalizedName,
        brand_id: data.brandId,
        category_id: data.categoryId,
        description: data.description ?? null,
        warranty_period: data.warrantyPeriod,
    });

    return {newProduct};
};

export const getProductDetailService = async(productId: string) => {
    const product = await findProductById(productId);

    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    return {product};
};

export const getAllProductsService = async(params: ProductListQuery) => {
    const {products, totalItems} = await getProductWithQuery(params);

    return {
        products,
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
            },
        },
    };
};

export const deleteProductService = async(productId: string) => {
    const product = await findProductById(productId);

    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    const delProduct = await deleteProduct(productId);
     
    return {delProduct};
}

export const updateProductService = async(productId: string, data: UpdateProductPayload) => {
    const product = await findProductById(productId);
 
    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    const productData: Prisma.productsUncheckedUpdateInput = {};

    if(data.productName !== undefined){
        const normalizedName = normalizeText(data.productName);
        const existedProduct = await findProductByNormalizeName(normalizedName);

        if(existedProduct && existedProduct.product_id !== productId){
            throw new AppError("Tên sản phẩm đã tồn tại", 409);
        }

        productData.product_name = data.productName;
        productData.normalized_name = normalizedName;
    }

    if(data.brandId !== undefined){
        const brand = await findBrandById(data.brandId);

        if(!brand) throw new AppError("Thương hiệu không tồn tại", 404);

        productData.brand_id = data.brandId;
    }

    if(data.categoryId !== undefined){
        const category = await findCategoryById(data.categoryId);

        if(!category) throw new AppError("Danh mục không tồn tại", 404);

        productData.category_id = data.categoryId;
    }

    if(data.description !== undefined) productData.description = data.description;

    if(data.warrantyPeriod !== undefined) productData.warranty_period = data.warrantyPeriod;

    const updProduct = await updateProduct(productId, productData);

    return {updProduct};
}
