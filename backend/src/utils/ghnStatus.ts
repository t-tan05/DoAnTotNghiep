import { orders_status } from "@prisma/client";

export const mapGhnStatusToOrderStatus = (ghnStatus: string) => {
    if(["ready_to_pick", "picking", "picked", "transporting", "sorting", "delivering"].includes(ghnStatus)) {
        return orders_status.SHIPPED;
    }

    if(ghnStatus === "delivery_fail") {
        return orders_status.DELIVERY_FAILED;
    }

    if(["waiting_to_return", "return", "returned"].includes(ghnStatus)) {
        return orders_status.RETURNED;
    }

    if(["cancel", "cancelled"].includes(ghnStatus)) {
        return orders_status.CANCELLED;
    }

    return null;
};