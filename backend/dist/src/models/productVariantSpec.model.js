export const createProductVariantSpecTransaction = async (tx, data) => {
    return await tx.product_variant_specs.createMany({
        data,
    });
};
export const deleteProductVariantSpecTransaction = async (tx, variantId) => {
    return await tx.product_variant_specs.deleteMany({
        where: {
            variant_id: variantId,
        },
    });
};
