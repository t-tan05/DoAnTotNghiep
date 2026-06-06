import prisma from "#config/prisma";
import { createProductVariantTransaction } from "./productVariant.model.js";
import { createInventoryTransaction } from "./inventory.model.js";
import { createProductImageTransaction } from "./productImage.model.js";
import { createVariantAttributeTransaction } from "./variantAttributeValue.model.js";
import { createProductVariantSpecTransaction } from "./productVariantSpec.model.js";
export const findProductByNormalizeName = async (normalizedName) => {
    return await prisma.products.findUnique({
        where: {
            normalized_name: normalizedName,
        },
        include: {
            brands: true,
            categories: true,
            product_images: true,
            product_variants: true,
            products_promotions: true,
            statistics_products: true,
            reviews: true,
        }
    });
};
export const createProduct = async (productData, productVariantData, inventoryData, variantAttributeData, productVariantSpecData, imageData) => {
    return await prisma.$transaction(async (tx) => {
        const newProduct = await tx.products.create({
            data: productData
        });
        await createProductVariantTransaction(tx, productVariantData);
        if (variantAttributeData.length > 0) {
            await createVariantAttributeTransaction(tx, variantAttributeData);
        }
        if (productVariantSpecData.length > 0) {
            await createProductVariantSpecTransaction(tx, productVariantSpecData);
        }
        if (imageData.length > 0) {
            await createProductImageTransaction(tx, imageData);
        }
        if (inventoryData.length > 0) {
            await createInventoryTransaction(tx, inventoryData);
        }
        return newProduct;
    });
};
export const findProductById = async (productId) => {
    return await prisma.products.findUnique({
        where: {
            product_id: productId,
        },
        select: {
            product_id: true,
            product_name: true,
            description: true,
            warranty_period: true,
            created_at: true,
            updated_at: true,
            brands: {
                select: {
                    brand_id: true,
                    brand_name: true
                }
            },
            categories: {
                select: {
                    category_id: true,
                    category_name: true
                }
            },
            product_variants: {
                select: {
                    variant_id: true,
                    sku: true,
                    price: true,
                    quantity_in_stock: true,
                    reserved_quantity: true,
                    sold_quantity: true,
                    product_images: {
                        select: {
                            image_id: true,
                            image_url: true,
                            is_default: true
                        }
                    },
                    variant_attribute_values: {
                        select: {
                            attribute_values: {
                                select: {
                                    attribute_value_id: true,
                                    value: true,
                                    product_attributes: {
                                        select: {
                                            attribute_id: true,
                                            attribute_name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    product_variant_specs: {
                        select: {
                            spec_key: true,
                            spec_value: true,
                            display_order: true
                        },
                        orderBy: {
                            display_order: "asc"
                        }
                    }
                }
            }
        }
    });
};
export const getAllProducts = async () => {
    return await prisma.products.findMany({
        select: {
            product_id: true,
            product_name: true,
            description: true,
            warranty_period: true,
            created_at: true,
            brands: {
                select: {
                    brand_id: true,
                    brand_name: true,
                }
            },
            categories: {
                select: {
                    category_id: true,
                    category_name: true,
                }
            },
            product_variants: {
                select: {
                    variant_id: true,
                    sku: true,
                    price: true,
                    quantity_in_stock: true,
                    product_images: {
                        select: {
                            image_url: true,
                            is_default: true,
                        },
                        where: {
                            is_default: true
                        },
                        take: 1
                    }
                }
            }
        },
        orderBy: {
            created_at: "desc",
        },
    });
};
export const updateProduct = async (productId, data) => {
    return await prisma.products.update({
        where: {
            product_id: productId,
        },
        data
    });
};
export const deleteProduct = async (productId) => {
    return await prisma.products.delete({
        where: {
            product_id: productId
        },
    });
};
export const findProductByCategoryId = async (categoryId) => {
    return await prisma.products.findFirst({
        where: {
            categories: {
                category_id: categoryId,
            },
        },
    });
};
export const findProductByBrandId = async (brandId) => {
    return await prisma.products.findFirst({
        where: {
            brands: {
                brand_id: brandId,
            },
        },
    });
};
