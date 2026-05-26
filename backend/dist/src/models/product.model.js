import prisma from "#config/prisma";
import { createProductVariantTransaction } from "./productVariant.model.js";
import { createInventoryTransaction } from "./inventory.model.js";
import { createProductImageTransaction } from "./productImage.model.js";
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
            await tx.variant_attribute_values.createMany({
                data: variantAttributeData,
            });
        }
        if (productVariantSpecData.length > 0) {
            await tx.product_variant_specs.createMany({
                data: productVariantSpecData,
            });
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
