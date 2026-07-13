import { CatchAsync } from "#utils/CatchAsync";
import AppError from "#utils/AppError";
import { getGhnDistrictsByProvinceService, getGhnProvincesService, getGhnWardsByDistrictService, } from "#services/ghn.service";
export const getGhnProvincesController = CatchAsync(async (_req, res) => {
    const data = await getGhnProvincesService();
    res.status(200).json({
        success: true,
        message: "Lấy danh sách tỉnh/thành GHN thành công.",
        data: {
            ...data
        },
    });
});
export const getGhnDistrictsController = CatchAsync(async (req, res) => {
    const provinceId = Number(req.query.provinceId);
    if (!provinceId) {
        throw new AppError("Thiếu mã tỉnh/thành GHN.", 400);
    }
    const data = await getGhnDistrictsByProvinceService(provinceId);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách quận/huyện GHN thành công.",
        data,
    });
});
export const getGhnWardsController = CatchAsync(async (req, res) => {
    const districtId = Number(req.query.districtId);
    if (!districtId) {
        throw new AppError("Thiếu mã quận/huyện GHN.", 400);
    }
    const data = await getGhnWardsByDistrictService(districtId);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách phường/xã GHN thành công.",
        data: {
            ...data
        },
    });
});
