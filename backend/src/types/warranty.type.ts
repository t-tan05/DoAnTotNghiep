import { warranties_status, warranty_request_channel, warranty_service_method } from "@prisma/client";

export type WarrantyListQuery = {
    page: number;
    limit: number;
    search?: string;
    status?: warranties_status;
    requestChannel?: warranty_request_channel;
    serviceMethod?: warranty_service_method;
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "received_date" | "created_at" | "updated_at" | "pickup_scheduled_at" | "return_scheduled_at";
    sortOrder?: "asc" | "desc";
};

export type CreateWarrantyPayload = {
    serialNumber: string;
    issueDescription: string;
    issueCategoryId?: string;
    serviceMethod?: warranty_service_method;
    pickupReceiverName?: string;
    pickupPhone?: string;
    pickupAddress?: string;
    note?: string;
};

export type AddWarrantyProcessPayload = {
    action: string;
    note?: string;
    expectedReturnDate?: string;
    repairActions?: string;
    accessoryChanged?: string;
};

export type WarrantyNotePayload = {
    note?: string;
};

export type SchedulePickupPayload = {
    pickupReceiverName: string;
    pickupPhone: string;
    pickupAddress: string;
    pickupScheduledAt: string;
    note?: string;
};

export type InspectWarrantyPayload = {
    inspectionNote?: string;
    inspectionResult: string;
    isWarrantyEligible: boolean;
    estimatedCost?: number;
    policyId?: string;
    note?: string;
};

export type RepairWarrantyPayload = {
    note?: string;
    expectedReturnDate?: string;
    repairActions?: string;
    accessoryChanged?: string;
};

export type SendToBrandPayload = {
    brandName: string;
    brandTicketCode?: string;
    note?: string;
};

export type ScheduleReturnPayload = {
    returnMethod: warranty_service_method;
    returnReceiverName?: string;
    returnPhone?: string;
    returnAddress?: string;
    returnScheduledAt?: string;
    note?: string;
};
