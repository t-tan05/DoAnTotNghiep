import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";
import type {
    CreateWarrantyPayload,
    InspectWarrantyPayload,
    MyWarrantiesResponse,
    RepairWarrantyPayload,
    SchedulePickupPayload,
    ScheduleReturnPayload,
    SendToBrandPayload,
    StaffWarrantyListQuery,
    WarrantyDetailResponse,
    WarrantyLookupResponse,
    WarrantyNotePayload,
} from "@/types/warranty.type";

export const warrantyService = {
    lookupBySerial: async(serialNumber: string) => {
        const res = await api.get<BackendSuccess<WarrantyLookupResponse>>("/warranties/lookup", {
            params: {
                serialNumber,
            },
        });

        if(!res.data.data) {
            throw new Error("Không kiểm tra được serial bảo hành.");
        }

        return res.data.data;
    },

    create: async(payload: CreateWarrantyPayload) => {
        const res = await api.post<BackendSuccess<WarrantyDetailResponse>>("/warranties", payload);

        if(!res.data.data) {
            throw new Error("Không tạo được yêu cầu bảo hành.");
        }

        return res.data.data;
    },

    getMine: async(page = 1, limit = 5) => {
        const res = await api.get<BackendSuccess<MyWarrantiesResponse>>("/warranties/me", {
            params: {
                page,
                limit,
            },
        });

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách bảo hành.");
        }

        return res.data.data;
    },

    getMyDetail: async(warrantyId: string) => {
        const res = await api.get<BackendSuccess<WarrantyDetailResponse>>(`/warranties/me/${warrantyId}`);

        if(!res.data.data) {
            throw new Error("Không lấy được chi tiết bảo hành.");
        }

        return res.data.data;
    },

    getAllForStaff: async(query: StaffWarrantyListQuery) => {
        const res = await api.get<BackendSuccess<MyWarrantiesResponse>>("/warranties", {
            params: query,
        });

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách bảo hành.");
        }

        return res.data.data;
    },

    getDetailForStaff: async(warrantyId: string) => {
        const res = await api.get<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}`);

        if(!res.data.data) {
            throw new Error("Không lấy được chi tiết bảo hành.");
        }

        return res.data.data;
    },

    approve: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/approve`, payload);
        return res.data.data;
    },

    reject: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/reject`, payload);
        return res.data.data;
    },

    customerDropOff: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/customer-drop-off`, payload);
        return res.data.data;
    },

    schedulePickup: async(warrantyId: string, payload: SchedulePickupPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/schedule-pickup`, payload);
        return res.data.data;
    },

    pickedUp: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/picked-up`, payload);
        return res.data.data;
    },

    receive: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/receive`, payload);
        return res.data.data;
    },

    inspect: async(warrantyId: string, payload: InspectWarrantyPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/inspect`, payload);
        return res.data.data;
    },

    startRepair: async(warrantyId: string, payload: RepairWarrantyPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/start-repair`, payload);
        return res.data.data;
    },

    sendToBrand: async(warrantyId: string, payload: SendToBrandPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/send-to-brand`, payload);
        return res.data.data;
    },

    brandReturned: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/brand-returned`, payload);
        return res.data.data;
    },

    complete: async(warrantyId: string, payload: RepairWarrantyPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/complete`, payload);
        return res.data.data;
    },

    scheduleReturn: async(warrantyId: string, payload: ScheduleReturnPayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/schedule-return`, payload);
        return res.data.data;
    },

    returnToCustomer: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/return`, payload);
        return res.data.data;
    },

    cancel: async(warrantyId: string, payload: WarrantyNotePayload) => {
        const res = await api.patch<BackendSuccess<WarrantyDetailResponse>>(`/warranties/${warrantyId}/cancel`, payload);
        return res.data.data;
    },
};
