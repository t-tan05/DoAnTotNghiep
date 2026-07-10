import { findBrandById } from "#models/brand.model";
import { findCategoryById } from "#models/category.model";
import { findProductLineById } from "#models/productLine.model";
import { createProduct, deleteProduct, findProductById, findProductByNormalizeName, getProductWithQuery, getPublicProductFilterOptions, getPublicProductVariantsWithQuery, getRelatedProductVariants, updateProduct } from "#models/product.model";
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
    if (data.lineId) {
        const productLine = await findProductLineById(data.lineId);
        if (!productLine)
            throw new AppError("DÃ²ng sáº£n pháº©m khÃ´ng tá»“n táº¡i", 404);
        if (productLine.brand_id !== data.brandId || productLine.category_id !== data.categoryId) {
            throw new AppError("DÃ²ng sáº£n pháº©m khÃ´ng thuá»™c Ä‘Ãºng thÆ°Æ¡ng hiá»‡u vÃ  danh má»¥c", 400);
        }
    }
    const productId = crypto.randomUUID();
    const newProduct = await createProduct({
        product_id: productId,
        product_name: displayName,
        normalized_name: normalizedName,
        brand_id: data.brandId,
        category_id: data.categoryId,
        line_id: data.lineId ?? null,
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
                lineId: params.lineId,
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
    const nextBrandId = data.brandId ?? product.brands.brand_id;
    const nextCategoryId = data.categoryId ?? product.categories.category_id;
    if (data.lineId !== undefined) {
        if (data.lineId === null) {
            productData.line_id = null;
        }
        else {
            const productLine = await findProductLineById(data.lineId);
            if (!productLine)
                throw new AppError("DÃ²ng sáº£n pháº©m khÃ´ng tá»“n táº¡i", 404);
            if (productLine.brand_id !== nextBrandId || productLine.category_id !== nextCategoryId) {
                throw new AppError("DÃ²ng sáº£n pháº©m khÃ´ng thuá»™c Ä‘Ãºng thÆ°Æ¡ng hiá»‡u vÃ  danh má»¥c", 400);
            }
            productData.line_id = data.lineId;
        }
    }
    else if ((data.brandId !== undefined || data.categoryId !== undefined) && product.product_lines) {
        if (product.product_lines.brand_id !== nextBrandId || product.product_lines.category_id !== nextCategoryId) {
            productData.line_id = null;
        }
    }
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
const getVariantActivePromotion = (variant) => {
    const now = new Date();
    return variant.products.products_promotions
        ?.map((item) => item.promotions)
        .filter((promotion) => {
        return promotion
            && promotion.is_active
            && new Date(promotion.start_date) <= now
            && new Date(promotion.end_date) >= now;
    }) ?? [];
};
const mapPublicVariantCard = (variant) => {
    const originalPrice = Number(variant.price);
    const activePromotions = getVariantActivePromotion(variant);
    let bestPromotion = null;
    let bestDiscountPrice = originalPrice;
    for (const promotion of activePromotions) {
        const nextPrice = calculateDiscountPrice(originalPrice, promotion);
        if (nextPrice < bestDiscountPrice) {
            bestDiscountPrice = nextPrice;
            bestPromotion = promotion;
        }
    }
    const imageUrl = variant.image_url
        || variant.product_images?.find((image) => image.is_default)?.image_url
        || variant.product_images?.[0]?.image_url
        || null;
    return {
        product_id: variant.products.product_id,
        product_name: variant.products.product_name,
        brand: {
            brand_id: variant.products.brands.brand_id,
            brand_name: variant.products.brands.brand_name,
        },
        category: {
            category_id: variant.products.categories.category_id,
            category_name: variant.products.categories.category_name,
        },
        variant: {
            variant_id: variant.variant_id,
            sku: variant.sku,
            variant_name: variant.variant_name,
            price: originalPrice,
            original_price: originalPrice,
            discount_price: bestPromotion ? bestDiscountPrice : null,
            quantity_in_stock: variant.quantity_in_stock,
            image_url: imageUrl,
            attributes: variant.variant_attribute_values?.map((item) => ({
                attribute_id: item.attribute_values.product_attributes.attribute_id,
                attribute_name: item.attribute_values.product_attributes.attribute_name,
                attribute_value_id: item.attribute_values.attribute_value_id,
                value: item.attribute_values.value,
            })) ?? [],
            active_promotion: bestPromotion
                ? {
                    promotion_id: bestPromotion.promotion_id,
                    promotion_name: bestPromotion.promotion_name,
                    discount_type: bestPromotion.discount_type,
                    discount_value: bestPromotion.discount_value,
                }
                : null,
        },
    };
};
const normalizeAttributeText = (value) => {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};
const isColorAttributeName = (attributeName) => {
    const normalizedName = normalizeAttributeText(attributeName);
    return normalizedName.includes("mau")
        || normalizedName.includes("color");
};
const getVariantGroupingAttributes = (variant) => {
    return variant.variant_attribute_values
        ?.map((item) => ({
        name: item.attribute_values.product_attributes.attribute_name,
        value: item.attribute_values.value,
    }))
        .filter((attribute) => !isColorAttributeName(attribute.name))
        .sort((a, b) => normalizeAttributeText(a.name).localeCompare(normalizeAttributeText(b.name), "vi")) ?? [];
};
const getPublicVariantGroupKey = (variant) => {
    const productId = variant.products.product_id;
    const variantName = variant.variant_name?.trim();
    if (variantName) {
        return `${productId}__name:${normalizeAttributeText(variantName)}`;
    }
    const groupingAttributes = getVariantGroupingAttributes(variant);
    if (groupingAttributes.length > 0) {
        const attributeKey = groupingAttributes
            .map((attribute) => `${normalizeAttributeText(attribute.name)}:${normalizeAttributeText(attribute.value)}`)
            .join("|");
        return `${productId}__attrs:${attributeKey}`;
    }
    return `${productId}__product`;
};
const getVariantImageUrl = (variant) => {
    return variant.image_url
        || variant.product_images?.find((image) => image.is_default)?.image_url
        || variant.product_images?.[0]?.image_url
        || null;
};
const pickRepresentativeVariant = (variants) => {
    return [...variants].sort((a, b) => {
        const aInStock = Number(a.quantity_in_stock) > 0 ? 1 : 0;
        const bInStock = Number(b.quantity_in_stock) > 0 ? 1 : 0;
        if (aInStock !== bInStock) {
            return bInStock - aInStock;
        }
        const aHasImage = getVariantImageUrl(a) ? 1 : 0;
        const bHasImage = getVariantImageUrl(b) ? 1 : 0;
        if (aHasImage !== bHasImage) {
            return bHasImage - aHasImage;
        }
        return Number(a.price) - Number(b.price);
    })[0];
};
const findColorAttribute = (variant) => {
    const colorAttribute = variant.variant_attribute_values?.find((item) => isColorAttributeName(item.attribute_values.product_attributes.attribute_name));
    if (colorAttribute) {
        return colorAttribute;
    }
    return variant.variant_attribute_values?.find((item) => {
        const attributeName = String(item.attribute_values.product_attributes.attribute_name || "").toLowerCase();
        return attributeName.includes("màu")
            || attributeName.includes("mau")
            || attributeName.includes("color");
    });
};
export const groupPublicVariants = (variants) => {
    const groups = new Map();
    for (const variant of variants) {
        const key = getPublicVariantGroupKey(variant);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(variant);
    }
    return Array.from(groups.values()).map((groupVariants) => {
        const representativeVariant = pickRepresentativeVariant(groupVariants);
        const card = mapPublicVariantCard(representativeVariant);
        return {
            ...card,
            variant_count: groupVariants.length,
            color_options: groupVariants.map((variant) => {
                const colorAttribute = findColorAttribute(variant);
                return {
                    variant_id: variant.variant_id,
                    image_url: getVariantImageUrl(variant),
                    color: colorAttribute?.attribute_values.value || null,
                };
            }),
        };
    });
};
export const sortPublicProductCards = (products, sortBy) => {
    if (sortBy === "price_asc") {
        return [...products].sort((a, b) => Number(a.variant.discount_price ?? a.variant.price)
            - Number(b.variant.discount_price ?? b.variant.price));
    }
    if (sortBy === "price_desc") {
        return [...products].sort((a, b) => Number(b.variant.discount_price ?? b.variant.price)
            - Number(a.variant.discount_price ?? a.variant.price));
    }
    if (sortBy === "name_asc") {
        return [...products].sort((a, b) => String(a.variant.variant_name || a.product_name)
            .localeCompare(String(b.variant.variant_name || b.product_name), "vi"));
    }
    if (sortBy === "promotion") {
        return [...products].sort((a, b) => {
            const aOriginalPrice = Number(a.variant.original_price ?? a.variant.price ?? 0);
            const bOriginalPrice = Number(b.variant.original_price ?? b.variant.price ?? 0);
            const aCurrentPrice = Number(a.variant.discount_price ?? a.variant.price ?? 0);
            const bCurrentPrice = Number(b.variant.discount_price ?? b.variant.price ?? 0);
            const aDiscount = Math.max(0, aOriginalPrice - aCurrentPrice);
            const bDiscount = Math.max(0, bOriginalPrice - bCurrentPrice);
            return bDiscount - aDiscount;
        });
    }
    return products;
};
export const getPublicProductsService = async (params) => {
    const { variants } = await getPublicProductVariantsWithQuery({
        ...params,
        page: 1,
        limit: 10000,
    });
    const filterOptions = await getPublicProductFilterOptions();
    const groupedProducts = sortPublicProductCards(groupPublicVariants(variants), params.sortBy);
    const totalItems = groupedProducts.length;
    const start = (params.page - 1) * params.limit;
    const paginatedProducts = groupedProducts.slice(start, start + params.limit);
    return {
        products: paginatedProducts,
        filters: {
            brands: filterOptions.brands.map((brand) => ({
                id: brand.brand_id,
                name: brand.brand_name
            })),
            categories: filterOptions.categories.map((category) => ({
                id: category.category_id,
                name: category.category_name,
            })),
            maxPrice: filterOptions.maxPrice,
        },
        meta: {
            pagination: {
                page: params.page,
                limit: params.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / params.limit),
            },
            sort: {
                sortBy: params.sortBy,
            },
            filters: {
                search: params.search,
                brandId: params.brandId,
                categoryId: params.categoryId,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
            },
        },
    };
};
export const getRelatedProductsService = async (productId) => {
    const product = await findProductById(productId);
    if (!product)
        throw new AppError("Không tìm thấy sản phẩm.", 404);
    const { variants } = await getRelatedProductVariants({
        productId: product.product_id,
        brandId: product.brands.brand_id,
        lineId: product.line_id,
        limit: 20,
    });
    const groupedProducts = groupPublicVariants(variants);
    const uniqueByProduct = new Map();
    for (const item of groupedProducts) {
        if (!uniqueByProduct.has(item.product_id)) {
            uniqueByProduct.set(item.product_id, item);
        }
        if (uniqueByProduct.size >= 20)
            break;
    }
    return {
        products: Array.from(uniqueByProduct.values()),
    };
};
