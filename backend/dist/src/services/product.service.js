import { findBrandById } from "#models/brand.model";
import { findCategoryById } from "#models/category.model";
import { createProduct, deleteProduct, findProductById, findProductByNormalizeName, getProductWithQuery, updateProduct } from "#models/product.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
export const createProductService = async (data) => {
    //tên hiển thị
    const displayName = data.productName.trim();
    //Tên được chuẩn hóa
    const normalizedName = normalizeText(displayName);
    //Kiểm tra tên sản phẩm đã tồn tại chưa
    const existedProduct = await findProductByNormalizeName(normalizedName);
    if (existedProduct)
        throw new AppError("Tên sản phẩm đã tồn tại", 409);
    const brand = await findBrandById(data.brandId);
    //Kiểm tra brand có tồn tại không
    if (!brand)
        throw new AppError("Thương hiệu không tồn tại", 404);
    const category = await findCategoryById(data.categoryId);
    //Kiểm tra category có tồn tại không
    if (!category)
        throw new AppError("Danh mục không tồn tại", 404);
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
    return { newProduct };
};
export const getProductDetailService = async (productId) => {
    const product = await findProductById(productId);
    if (!product)
        throw new AppError("Không tìm thấy sản phẩm", 404);
    return { product: applyPromotionToProduct(product) };
};
export const getAllProductsService = async (params) => {
    const { products, totalItems } = await getProductWithQuery(params);
    const productsWithPromotion = products.map(applyPromotionToProduct);
    return {
        products: productsWithPromotion,
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
export const deleteProductService = async (productId) => {
    const product = await findProductById(productId);
    if (!product)
        throw new AppError("Không tìm thấy sản phẩm", 404);
    const delProduct = await deleteProduct(productId);
    return { delProduct };
};
export const updateProductService = async (productId, data) => {
    const product = await findProductById(productId);
    if (!product)
        throw new AppError("Không tìm thấy sản phẩm", 404);
    const productData = {};
    if (data.productName !== undefined) {
        const normalizedName = normalizeText(data.productName);
        const existedProduct = await findProductByNormalizeName(normalizedName);
        if (existedProduct && existedProduct.product_id !== productId) {
            throw new AppError("Tên sản phẩm đã tồn tại", 409);
        }
        productData.product_name = data.productName;
        productData.normalized_name = normalizedName;
    }
    if (data.brandId !== undefined) {
        const brand = await findBrandById(data.brandId);
        if (!brand)
            throw new AppError("Thương hiệu không tồn tại", 404);
        productData.brand_id = data.brandId;
    }
    if (data.categoryId !== undefined) {
        const category = await findCategoryById(data.categoryId);
        if (!category)
            throw new AppError("Danh mục không tồn tại", 404);
        productData.category_id = data.categoryId;
    }
    if (data.description !== undefined)
        productData.description = data.description;
    if (data.warrantyPeriod !== undefined)
        productData.warranty_period = data.warrantyPeriod;
    const updProduct = await updateProduct(productId, productData);
    return { updProduct };
};
const getActivePromotions = (product) => {
    const now = new Date();
    return product.products_promotions
        ?.map((item) => item.promotions)
        .filter((promotion) => {
        return promotion
            && new Date(promotion.start_date) <= now
            && new Date(promotion.end_date) >= now;
    }) ?? [];
};
const calculateDiscountPrice = (price, promotion) => {
    if (!promotion)
        return price;
    if (promotion.discount_type === "PERCENT") {
        return Math.max(0, price - (price * Number(promotion.discount_value)) / 100);
    }
    return Math.max(0, price - Number(promotion.discount_value));
};
const applyPromotionToProduct = (product) => {
    const activePromotions = getActivePromotions(product);
    const productVariants = product.product_variants.map((variant) => {
        const originalPrice = Number(variant.price);
        let bestPromotion = null;
        let bestDiscountPrice = originalPrice;
        for (const promotion of activePromotions) {
            const nextPrice = calculateDiscountPrice(originalPrice, promotion);
            if (nextPrice < bestDiscountPrice) {
                bestDiscountPrice = nextPrice;
                bestPromotion = promotion;
            }
        }
        return {
            ...variant,
            original_price: originalPrice,
            discount_price: bestPromotion ? bestDiscountPrice : null,
            active_promotion: bestPromotion
                ? {
                    promotion_id: bestPromotion.promotion_id,
                    promotion_name: bestPromotion.promotion_name,
                    discount_type: bestPromotion.discount_type,
                    discount_value: bestPromotion.discount_value,
                }
                : null,
        };
    });
    return {
        ...product,
        product_variants: productVariants,
    };
};
