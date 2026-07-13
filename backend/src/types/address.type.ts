export interface CreateAddressPayload {
    receiverName: string;
    phoneNumber: string;
    province: string,
    district: string,
    ward: string,
    street: string,
    setDefault?: boolean;
    ghnProvinceId: number;
    ghnWardCode: string;
    ghnLegacyDistrictId: number;
};

export interface UpdateAddressPayload {
    receiverName: string;
    phoneNumber: string;
    province: string,
    district: string,
    ward: string,
    street: string,
    isDefault: boolean;
    ghnProvinceId: number;
    ghnWardCode: string;
    ghnLegacyDistrictId: number;
}