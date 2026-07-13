import { countAddressByUserId, createAddress, createDefaultAddressByTransaction, deleteAddressById, findAddressByIdAndUserId, findDefaultAddressByUserId, getAllAddressesByUserId, updateAddressByTransaction } from "#models/address.model";
import AppError from "#utils/AppError";
import crypto from "crypto";
export const createAddressService = async (userId, payload) => {
    const addressId = crypto.randomUUID();
    const addressData = {
        address_id: addressId,
        user_id: userId,
        receiver_name: payload.receiverName,
        phone_number: payload.phoneNumber,
        province: payload.province,
        district: payload.district,
        ward: payload.ward,
        street: payload.street,
        ghn_province_id: payload.ghnProvinceId,
        ghn_ward_code: payload.ghnWardCode,
        ghn_legacy_district_id: payload.ghnLegacyDistrictId,
        is_default: false,
    };
    const newAddress = payload.setDefault ? await createDefaultAddressByTransaction(addressData) : await createAddress(addressData);
    return { newAddress };
};
export const getAddressDefaultByUserIdService = async (userId) => {
    const address = await findDefaultAddressByUserId(userId);
    if (!address)
        throw new AppError("Chưa có địa chỉ mặc định vui lòng tạo.", 404);
    return { address };
};
export const getAllAddressByUserService = async (userId) => {
    const addresses = await getAllAddressesByUserId(userId);
    if (!addresses)
        throw new AppError("Chưa có địa chỉ nào.", 404);
    return { addresses };
};
export const updateAddressService = async (userId, addressId, payload) => {
    const address = await findAddressByIdAndUserId(addressId, userId);
    if (!address)
        throw new AppError("Địa chỉ không tồn tại", 404);
    if (address.is_default && !payload.isDefault) {
        throw new AppError("Không thể bỏ mặc định. Hãy chọn địa chỉ khác làm mặc định..", 400);
    }
    const updateData = {
        receiver_name: payload.receiverName,
        phone_number: payload.phoneNumber,
        province: payload.province,
        district: payload.district,
        ward: payload.ward,
        street: payload.street,
        ghn_province_id: payload.ghnProvinceId,
        ghn_ward_code: payload.ghnWardCode,
        ghn_legacy_district_id: payload.ghnLegacyDistrictId,
    };
    const updateAddress = await updateAddressByTransaction(userId, addressId, updateData, payload.isDefault);
    return { address: updateAddress };
};
export const deleteAddressService = async (userId, addressId) => {
    const address = await findAddressByIdAndUserId(addressId, userId);
    if (!address)
        throw new AppError("Địa chỉ không tồn tại", 404);
    const totalAddress = await countAddressByUserId(userId);
    if (totalAddress <= 1) {
        throw new AppError("Bạn phải có ít nhất 1 địa chỉ giao hàng", 400);
    }
    if (address.is_default)
        throw new AppError("Không thể xóa địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước.", 400);
    await deleteAddressById(addressId);
};
