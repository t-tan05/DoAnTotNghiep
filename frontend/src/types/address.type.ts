export type Address = {
  address_id: string;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  province: string;
  ward: string;
  street: string;
  is_default: boolean;
};

export type CreateAddressPayload = {
  receiverName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  street: string;
  setDefault?: boolean;
};

export type UpdateAddressPayload = {
  receiverName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  street: string;
  isDefault: boolean;
};