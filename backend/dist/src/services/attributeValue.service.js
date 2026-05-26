import { createAttributeValues, deleteAttributeValue, findAttributeValueById, findAttributeValueByNormalizedValue, findAttributeValuesByNormalizedValues, updateAttributeValue } from "#models/attributeValue.model";
import { findProductAttributeById } from "#models/productAttribute.model";
import { existAttributeValueByAttributeValueId } from "#models/variantAttributeValue.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
export const createAttributeValueService = async (data) => {
    if (!data?.values || !Array.isArray(data?.values)) {
        throw new AppError("values phải là một mảng", 400);
    }
    //Lấy ra danh sách attributeId
    const attributeIds = [...new Set(data?.values.map((item) => item?.attributeId))];
    for (const attributeId of attributeIds) {
        const attribute = await findProductAttributeById(attributeId);
        if (!attribute)
            throw new AppError(`Thuộc tính ${attributeId}id không tồn tại`, 404);
    }
    for (const attributeId of attributeIds) {
        //Lấy ra value của từng product_attribute
        const valueOfAttribute = data?.values.filter((item) => {
            return item?.attributeId === attributeId;
        });
        const normalizedSet = new Set();
        //Duyệt qua từng value
        for (const item of valueOfAttribute) {
            const normalizedValue = normalizeText(item?.value);
            if (normalizedSet.has(item?.value)) {
                throw new AppError(`Giá trị ${item.value} bị trùng trong request`, 400);
            }
            normalizedSet.add(normalizedValue);
        }
        const normalizedValues = [...normalizedSet];
        const existedValues = await findAttributeValuesByNormalizedValues(attributeId, normalizedValues);
        if (existedValues.length > 0)
            throw new AppError("Có giá trị thuộc tính đã tồn tại", 409);
    }
    const attributeValueData = data?.values.map((item) => {
        return {
            attribute_value_id: crypto.randomUUID(),
            attribute_id: item?.attributeId,
            value: item.value,
            normalized_value: normalizeText(item?.value),
            display_order: item?.displayOrder ?? 0,
        };
    });
    await createAttributeValues(attributeValueData);
    return { attributeValueData };
};
export const updateAttributeValueService = async (attributeValueId, value, displayOrder) => {
    const attributeValue = await findAttributeValueById(attributeValueId);
    if (!attributeValue)
        throw new AppError("Không tìm thấy giá trị thuộc tính cần cập nhật", 404);
    const normalizedValue = normalizeText(value);
    const existedNormalizedValue = await findAttributeValueByNormalizedValue(normalizedValue);
    if (existedNormalizedValue && existedNormalizedValue.attribute_value_id !== attributeValueId) {
        throw new AppError("Giá trị thuộc tính đã tồn tại", 409);
    }
    const updAttributeValue = await updateAttributeValue(attributeValueId, {
        value: value,
        normalized_value: normalizedValue,
        display_order: displayOrder,
    });
    return { updAttributeValue };
};
export const deleteAttributeValueService = async (attributeValueId) => {
    const attributeValue = await findAttributeValueById(attributeValueId);
    if (!attributeValue)
        throw new AppError("Không tìm thấy giá trị thuộc tính cần xóa", 404);
    const existedAttributeValue = await existAttributeValueByAttributeValueId(attributeValueId);
    if (existedAttributeValue)
        throw new AppError("Không thể xóa vì đang có sản phẩm sử dụng giá trị này", 409);
    const delAttributeValue = await deleteAttributeValue(attributeValueId);
    return [delAttributeValue];
};
