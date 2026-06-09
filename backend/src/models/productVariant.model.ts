import prisma from "#config/prisma"
import { Prisma } from "@prisma/client";
import { createVariantAttributeTransaction, deleteVariantAttributeTransaction } from "./variantAttributeValue.model.js";
import { createProductVariantSpecTransaction, deleteProductVariantSpecTransaction } from "./productVariantSpec.model.js";
import { createProductImageTransaction } from "./productImage.model.js";
import { createInventoryTransaction } from "./inventory.model.js";

export const findProductVariantBySku = async(sku: string) => {
    return await prisma.product_variants.findUnique({
        where: {
            sku,
        },
    });
};

export const findProductVariantById = async(variantId: string) => {
    return await prisma.product_variants.findUnique({
        where: {
            variant_id: variantId,
        },
        select: {
            variant_id: true,
            product_id: true,
            sku: true,
            price: true,
            quantity_in_stock: true,
            reserved_quantity: true,
            sold_quantity: true,
            image_url: true,
            public_id: true,
            product_images: {
                select: {
                    image_id: true,
                    image_url: true,
                    is_default: true,
                }
            },
            product_variant_specs: {
                select: {
                    spec_key: true,
                    spec_value: true,
                }
            },
            variant_attribute_values: {
                select: {
                    attribute_values: {
                        select: {
                            product_attributes: {
                                select: {
                                    attribute_id: true,
                                    attribute_name: true
                                }
                            },
                            value: true,
                        }
                    }
                }
            }
        }
    });
};

export const findProductVariantCombosByProductId = async(productId: string) => {
    return await prisma.product_variants.findMany({
        where: {
            product_id: productId,
        },
        select: {
            variant_id: true,
            variant_attribute_values: {
                select: {
                    attribute_value_id: true,
                },
            },
        },
    });
};

export const createProductVariantTransaction = async(
    tx: Prisma.TransactionClient, 
    data: Prisma.product_variantsUncheckedCreateInput[]
) => {
    return await tx.product_variants.createMany({
        data,
    });
};

//Tạo nhiều productVariants
export const createProductVariants = async(
    productVariantData: Prisma.product_variantsUncheckedCreateInput[],
    variantAttributeValueData: Prisma.variant_attribute_valuesUncheckedCreateInput[],
    productVariantSpecData: Prisma.product_variant_specsUncheckedCreateInput[],
    productImageData: Prisma.product_imagesUncheckedCreateInput[],
    inventoryTransactionData: Prisma.inventory_transactionsUncheckedCreateInput[]
) => {
    return await prisma.$transaction(async(tx) => {
        await createProductVariantTransaction(tx, productVariantData);

        if(variantAttributeValueData.length > 0) {
            await createVariantAttributeTransaction(tx, variantAttributeValueData);
        }

        if(productVariantSpecData.length > 0){
            await createProductVariantSpecTransaction(tx, productVariantSpecData);
        }

        if(productImageData.length > 0){
            await createProductImageTransaction(tx, productImageData);
        }

        if(inventoryTransactionData.length > 0){
            await createInventoryTransaction(tx, inventoryTransactionData);
        }

        return true;
    });
};

export const updateProductVariant = async(
    variantId: string,
    variantData: Prisma.product_variantsUpdateInput,
    shouldUpdateAttributes: boolean,
    variantAttributeValueData: Prisma.variant_attribute_valuesUncheckedCreateInput[],
    shouldUpdateSpecs: boolean,
    productVariantSpecData: Prisma.product_variant_specsUncheckedCreateInput[],
    inventoryTransactionData?: Prisma.inventory_transactionsUncheckedCreateInput,
) => {
    return await prisma.$transaction(async(tx) => {
        const updateVariant = await tx.product_variants.update({
            where: {
                variant_id: variantId,
            },
            data: variantData,
        });

        if(shouldUpdateAttributes){
            await deleteVariantAttributeTransaction(tx, variantId);

            if(variantAttributeValueData.length > 0){
                await createVariantAttributeTransaction(tx, variantAttributeValueData);
            }
        }

        if(shouldUpdateSpecs){
            await deleteProductVariantSpecTransaction(tx, variantId);

            if(productVariantSpecData.length > 0){
                await createProductVariantSpecTransaction(tx, productVariantSpecData);
            }
        }

        if(inventoryTransactionData){
            await createInventoryTransaction(tx, [inventoryTransactionData]);
        }

        return updateVariant;
    });
};
