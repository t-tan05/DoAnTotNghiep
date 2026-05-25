import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";
import { createProductVariantTransaction } from "./productVariant.model.js";
import { createInventoryTransaction } from "./inventory.model.js";
import { createProductImageTransaction } from "./productImage.model.js";



export const findProductByNormalizeName = async(normalizedName: string) => {
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

export const createProduct = async(
    productData: Prisma.productsUncheckedCreateInput,
    productVariantData: Prisma.product_variantsUncheckedCreateInput[],
    inventoryData: Prisma.inventory_transactionsUncheckedCreateInput[],
    variantAttributeData: Prisma.variant_attribute_valuesUncheckedCreateInput[],
    productVariantSpecData: Prisma.product_variant_specsUncheckedCreateInput[],
    imageData: Prisma.product_imagesUncheckedCreateInput[],
) => {
    return await prisma.$transaction(async(tx) => {
        const newProduct = await tx.products.create({
            data: productData
        });

        await createProductVariantTransaction(tx, productVariantData);

        if(variantAttributeData.length > 0){
            await tx.variant_attribute_values.createMany({
                data: variantAttributeData,
            });
        }

        if(productVariantSpecData.length > 0){
            await tx.product_variant_specs.createMany({
                data: productVariantSpecData,
            });
        }

        if(imageData.length > 0){
            await createProductImageTransaction(tx, imageData);
        }

        if(inventoryData.length > 0){
            await createInventoryTransaction(tx, inventoryData);
        }

        return newProduct;
    });
};


