import type { CreateAddressPayload, UpdateAddressPayload } from "@/types/address.type";
import { api } from "./api";
import axios from "axios";

export type ProvinceOption = {
    code: number;
    name: string;
};

export type WardOption = {
    code: number;
    name: string;
};

type ProvinceResponse = {
    code: number;
    name: string;
};

type ProvinceDetailResponse = {
    code: number;
    name: string;
    wards: WardOption[];
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

    getProvinces: async() => {
        const res = await axios.get<ProvinceResponse[]>("https://provinces.open-api.vn/api/v2/p/");
        return res.data;
    },

    getWardsByProvince: async (provinceCode: number | string) => {
        const res = await axios.get<ProvinceDetailResponse>(
            `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
        );

        return res.data.wards ?? [];
    },
}