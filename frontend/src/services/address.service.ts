import type { CreateAddressPayload, UpdateAddressPayload } from "@/types/address.type";
import { api } from "./api";

export type ProvinceOption = {
    code: number;
    name: string;
};

export type DistrictOption = {
    code: number;
    name: string;
};

export type WardOption = {
    code: string;
    name: string;
};

export const addressService = {
    getDefaultAddress: () => {
        return api.get("/addresses/address-default");
    },

    getAddresses: () => {
        return api.get("/addresses");
    },

    createAddress: (payload: CreateAddressPayload) => {
        return api.post("/addresses", payload);
    },

    updateAddress: (addressId: string, payload: UpdateAddressPayload) => {
        return api.put(`/addresses/${addressId}`, payload);
    },

    deleteAddress: (addressId: string) => {
        return api.delete(`/addresses/${addressId}`);
    },

    getGhnProvinces: async() => {
        const res = await api.get("/ghn/provinces");
        return res.data.data.provinces.map((item: { provinceId: number; provinceName: string }) => ({
            code: item.provinceId,
            name: item.provinceName,
        })) as ProvinceOption[];
    },

    getGhnDistricts: async(provinceId: number) => {
        const res = await api.get(`/ghn/districts?provinceId=${provinceId}`);
        return res.data.data.districts.map((item: { districtId: number; districtName: string }) => ({
            code: item.districtId,
            name: item.districtName,
        })) as DistrictOption[];
    },

    getGhnWards: async(districtId: number) => {
        const res = await api.get(`/ghn/wards?districtId=${districtId}`);
        return res.data.data.wards.map((item: { wardCode: string; wardName: string }) => ({
            code: item.wardCode,
            name: item.wardName,
        })) as WardOption[];
    },
}
