export const createProductImageTransaction = async (tx, data) => {
    return await tx.product_images.createMany({
        data,
    });
};
