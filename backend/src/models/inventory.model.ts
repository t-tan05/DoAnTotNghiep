import { Prisma } from "@prisma/client";

export const createInventoryTransaction = async(
    tx: Prisma.TransactionClient,
    inventoryData: Prisma.inventory_transactionsUncheckedCreateInput[],
) => {
    return await tx.inventory_transactions.createMany({
        data: inventoryData,
    });
};

