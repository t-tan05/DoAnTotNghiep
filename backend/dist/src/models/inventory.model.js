export const createInventoryTransaction = async (tx, inventoryData) => {
    return await tx.inventory_transactions.createMany({
        data: inventoryData,
    });
};
