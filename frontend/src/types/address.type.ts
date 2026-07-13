export type Address = {
  address_id: string;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  ghn_province_id: number;
  ghn_ward_code: string;
  ghn_legacy_district_id: number;
  is_default: boolean;
};

export type CreateAddressPayload = {
  receiverName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  ghnProvinceId: number;
  ghnWardCode: string;
  ghnLegacyDistrictId: number;
  setDefault?: boolean;
};

export type UpdateAddressPayload = {
  receiverName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  ghnProvinceId: number;
  ghnWardCode: string;
  ghnLegacyDistrictId: number;
};