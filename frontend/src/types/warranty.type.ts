export type WarrantyStatus =
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "CUSTOMER_DROP_OFF"
    | "PICKUP_SCHEDULED"
    | "PICKED_UP"
    | "RECEIVED"
    | "INSPECTING"
    | "WAITING_CUSTOMER_CONFIRMATION"
    | "IN_PROGRESS"
    | "SENT_TO_BRAND"
    | "BRAND_RETURNED"
    | "COMPLETED"
    | "RETURN_SCHEDULED"
    | "RETURNED"
    | "CANCELLED";

export type WarrantyServiceMethod = "PICKUP" | "DROP_OFF" | "SHIPPING";
export type WarrantyRequestChannel = "ONLINE" | "STORE" | "HOTLINE";

export type WarrantyProductImage = {
    image_id?: string | number;
    image_url: string;
    is_default?: boolean | null;
};

export type WarrantyProduct = {
    product_id: string;
    product_name: string;
    warranty_period?: number | null;
    brands?: {
        brand_id?: string;
        brand_name?: string;
    } | null;
    categories?: {
        category_id?: string;
        category_name?: string;
    } | null;
};

export type WarrantyVariant = {
    variant_id: string;
    sku?: string | null;
    variant_name?: string | null;
    image_url?: string | null;
    products: WarrantyProduct;
    product_images?: WarrantyProductImage[];
};

export type WarrantyDevice = {
    device_id: string;
    serial_number: string;
    status?: string;
    sold_date?: string | null;
    warranty_start_date?: string | null;
    warranty_end_date?: string | null;
    product_variants: WarrantyVariant;
};

export type WarrantyProcess = {
    process_id: string;
    warranty_id: string;
    employee_id?: string | null;
    action: string;
    old_status?: WarrantyStatus | null;
    new_status?: WarrantyStatus | null;
    note?: string | null;
    created_at: string;
    users?: {
        user_id: string;
        name?: string | null;
        email?: string | null;
    } | null;
};

export type Warranty = {
    warranty_id: string;
    warranty_code: string;
    device_id: string;
    customer_id: string;
    order_id?: string | null;
    assigned_employee_id?: string | null;
    created_by_employee_id?: string | null;
    status: WarrantyStatus;
    request_channel?: string | null;
    service_method: WarrantyServiceMethod;
    issue_description: string;
    note?: string | null;
    pickup_receiver_name?: string | null;
    pickup_phone?: string | null;
    pickup_address?: string | null;
    pickup_scheduled_at?: string | null;
    return_method?: WarrantyServiceMethod | null;
    return_receiver_name?: string | null;
    return_phone?: string | null;
    return_address?: string | null;
    return_scheduled_at?: string | null;
    received_date?: string | null;
    expected_return_date?: string | null;
    completed_date?: string | null;
    returned_date?: string | null;
    estimated_cost?: number | string | null;
    is_warranty_eligible?: boolean | null;
    inspection_note?: string | null;
    inspection_result?: string | null;
    repair_actions?: string | null;
    accessory_changed?: string | null;
    brand_name?: string | null;
    brand_ticket_code?: string | null;
    created_at: string;
    updated_at?: string | null;
    devices: WarrantyDevice;
    users?: {
        user_id: string;
        name?: string | null;
        email?: string | null;
    } | null;
    warranty_processes?: WarrantyProcess[];
    users_warranties_assigned_employee_idTousers?: {
        user_id: string;
        name?: string | null;
        email?: string | null;
    } | null;
};

export type WarrantyLookupResponse =
    | {
        isValid: false;
        message: string;
        serialNumber?: string;
        warrantyEndDate?: string | null;
    }
    | {
        isValid: true;
        message: string;
        deviceId: string;
        serialNumber: string;
        soldDate?: string | null;
        warrantyEndDate?: string | null;
        product: WarrantyProduct;
        variant: WarrantyVariant;
    };

export type WarrantyPhoneLookupItem = {
    orderId: string;
    orderDetailId: string;
    deviceId: string | null;
    serialNumber: string | null;
    soldDate?: string | null;
    warrantyEndDate?: string | null;
    isValid: boolean;
    hasOpenWarranty: boolean;
    message: string;
    product: WarrantyProduct;
    variant: WarrantyVariant;
};

export type WarrantyPhoneLookupResponse = {
    isValid: boolean;
    message: string;
    phoneNumber: string;
    items: WarrantyPhoneLookupItem[];
};

export type CreateWarrantyPayload = {
    serialNumber?: string;
    deviceId?: string;
    issueDescription: string;
    serviceMethod?: WarrantyServiceMethod;
    pickupReceiverName?: string;
    pickupPhone?: string;
    pickupAddress?: string;
    note?: string;
};

export type MyWarrantiesResponse = {
    warranties: Warranty[];
    meta: {
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    };
};

export type WarrantyDetailResponse = {
    warranty: Warranty;
};

export type StaffWarrantyListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    status?: WarrantyStatus | "";
    requestChannel?: WarrantyRequestChannel | "";
    serviceMethod?: WarrantyServiceMethod | "";
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "received_date" | "created_at" | "updated_at" | "pickup_scheduled_at" | "return_scheduled_at";
    sortOrder?: "asc" | "desc";
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
    estimatedCost?: number | null;
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
    returnMethod: WarrantyServiceMethod;
    returnReceiverName?: string;
    returnPhone?: string;
    returnAddress?: string;
    returnScheduledAt?: string;
    note?: string;
};
