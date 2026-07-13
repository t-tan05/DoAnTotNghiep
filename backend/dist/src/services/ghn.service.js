import AppError from "#utils/AppError";
import axios from "axios";
const GHN_BASE_URL = process.env.GHN_API_URL;
const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
const ghnApi = axios.create({
    baseURL: GHN_BASE_URL,
    headers: {
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID,
    },
});
const unwrapGhnData = (response) => {
    if (response.data?.code !== 200) {
        throw new AppError(response.data?.message || "GHN xử lý thất bại.", 400);
    }
    return response.data.data;
};
export const getGhnProvincesService = async () => {
    const response = await ghnApi.get("/master-data/province");
    const provinces = unwrapGhnData(response);
    return {
        provinces: provinces.map((item) => ({
            provinceId: item.ProvinceID,
            provinceName: item.ProvinceName,
        })),
    };
};
export const getGhnDistrictsByProvinceService = async (provinceId) => {
    const response = await ghnApi.get("/master-data/district", {
        params: {
            province_id: provinceId,
        },
    });
    const districts = unwrapGhnData(response);
    return {
        districts: districts.map((item) => ({
            districtId: item.DistrictID,
            districtName: item.DistrictName,
        })),
    };
};
export const getGhnWardsByDistrictService = async (districtId) => {
    const response = await ghnApi.get("/master-data/ward", {
        params: {
            district_id: districtId,
        },
    });
    const wards = unwrapGhnData(response);
    return {
        wards: wards.map((item) => ({
            wardCode: item.WardCode,
            wardName: item.WardName,
        })),
    };
};
export const createGhnOrderService = async (payload) => {
    const response = await ghnApi.post("/v2/shipping-order/create", {
        payment_type_id: 1,
        note: "CHOXEMHANGKHONGTHU",
        required_note: "CHOXEMHANGKHONGTHU",
        client_order_code: payload.clientOrderCode,
        to_name: payload.toName,
        to_phone: payload.toPhone,
        to_address: payload.toAddress,
        to_ward_code: payload.toWardCode,
        to_district_id: payload.toDistrictId,
        cod_amount: payload.codAmount,
        content: payload.content,
        weight: payload.weight,
        length: payload.length,
        width: payload.width,
        height: payload.height,
        service_type_id: 2,
        items: payload.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
    });
    return unwrapGhnData(response);
};
