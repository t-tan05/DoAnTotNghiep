import {
    createAttributeValues,
    deleteAttributeValue,
    findAttributeValueByAttributeAndNormalizedValue,
    findAttributeValueById,
    findAttributeValuesByNormalizedValues,
    updateAttributeValue
} from "#models/attributeValue.model";
import { findProductAttributeById } from "#models/productAttribute.model";
import { existAttributeValueByAttributeValueId } from "#models/variantAttributeValue.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import type { CreateAttributeValuePayload, UpdateAttributeValuePayload } from "#types/attributeValue.type";

export const createAttributeValueService = async(data: CreateAttributeValuePayload) => {
    const attributeIds = [...new Set(data.values.map((item) => item.attributeId))];

    for(const attributeId of attributeIds){
        const attribute = await findProductAttributeById(attributeId);

        if(!attribute) throw new AppError(`Thuộc tính ${attributeId} không tồn tại`, 404);
    }

    for(const attributeId of attributeIds){
        const valuesOfAttribute = data.values.filter((item) => item.attributeId === attributeId);
        const normalizedSet = new Set<string>();

        for(const item of valuesOfAttribute){
            const normalizedValue = normalizeText(item.value);

            if(normalizedSet.has(normalizedValue)){
                throw new AppError(`Giá trị ${item.value} bị trùng trong request`, 400);
            }

            normalizedSet.add(normalizedValue);
        }

        const normalizedValues = [...normalizedSet];
        const existedValues = await findAttributeValuesByNormalizedValues(attributeId, normalizedValues);

        if(existedValues.length > 0) throw new AppError("Có giá trị thuộc tính đã tồn tại", 409);
    }

    const attributeValueData = data.values.map((item) => ({
        attribute_value_id: crypto.randomUUID(),
        attribute_id: item.attributeId,
        value: item.value,
        normalized_value: normalizeText(item.value),
        display_order: item.displayOrder ?? 0,
    }));

    await createAttributeValues(attributeValueData);

    return {attributeValueData};
};

export const updateAttributeValueService = async(attributeValueId: string, payload: UpdateAttributeValuePayload) => {
    const attributeValue = await findAttributeValueById(attributeValueId);

    if(!attributeValue) throw new AppError("Không tìm thấy giá trị thuộc tính cần cập nhật", 404);

    const attributeValueData: Prisma.attribute_valuesUpdateInput = {};

    if(payload.value !== undefined){
        const normalizedValue = normalizeText(payload.value);
        const existedNormalizedValue = await findAttributeValueByAttributeAndNormalizedValue(attributeValue.attribute_id, normalizedValue);

        if(existedNormalizedValue && existedNormalizedValue.attribute_value_id !== attributeValueId) {
            throw new AppError("Giá trị thuộc tính đã tồn tại", 409);
        }

        attributeValueData.value = payload.value;
        attributeValueData.normalized_value = normalizedValue;
    }

    if(payload.displayOrder !== undefined) attributeValueData.display_order = payload.displayOrder;

    const updAttributeValue = await updateAttributeValue(attributeValueId, attributeValueData);

    return {updAttributeValue};
};

export const deleteAttributeValueService = async(attributeValueId: string) => {
    const attributeValue = await findAttributeValueById(attributeValueId);

    if(!attributeValue) throw new AppError("Không tìm thấy giá trị thuộc tính cần xóa", 404);

    const existedAttributeValue = await existAttributeValueByAttributeValueId(attributeValueId);

    if(existedAttributeValue) throw new AppError("Không thể xóa vì đang có sản phẩm sử dụng giá trị này", 409);

    const delAttributeValue = await deleteAttributeValue(attributeValueId);

    return {delAttributeValue};
}