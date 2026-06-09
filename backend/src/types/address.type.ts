export interface CreateAddressPayload {
    receiverName: string;
    phoneNumber: string;
    province: string,
    ward: string,
    street: string,
    setDefault?: boolean;
};

export interface UpdateAddressPayload {
    receiverName: string;
    phoneNumber: string;
    province: string,
    ward: string,
    street: string,
    isDefault: boolean;
}