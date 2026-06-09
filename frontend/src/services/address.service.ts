import type { CreateAddressPayload, UpdateAddressPayload } from "@/types/address.type";
import { api } from "./api";

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
    }
}