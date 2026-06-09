import { createAddressService, deleteAddressService, getAddressDefaultByUserIdService, getAllAddressByUserService, updateAddressService } from "#services/address.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createAddressController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const data = await createAddressService(userId, req.body);
    res.status(201).json({
        success: true,
        message: "Tạo địa chỉ nhận hàng thành công.",
        data: {
            ...data,
        },
    });
});
export const getAddressDefaultController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const data = await getAddressDefaultByUserIdService(userId);
    res.status(200).json({
        success: true,
        message: "Lấy địa chỉ mặc định thành công.",
        data: {
            ...data,
        },
    });
});
export const getAllAddressByUserController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const data = await getAllAddressByUserService(userId);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách địa chỉ thành công.",
        data: {
            ...data,
        },
    });
});
export const updateAddressController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const addressId = req.params.addressId;
    const data = await updateAddressService(userId, addressId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật địa chỉ thành công.",
        data: {
            ...data,
        },
    });
});
export const deleteAddressController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const addressId = req.params.addressId;
    await deleteAddressService(userId, addressId);
    res.status(200).json({
        success: true,
        message: "Xóa địa chỉ thành công.",
    });
});
