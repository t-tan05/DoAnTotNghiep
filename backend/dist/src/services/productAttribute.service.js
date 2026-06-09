import { findAttributeValueByProductAttributeId } from "#models/attributeValue.model";
import { createProductAttributes, deleteProductAttribute, findAllProductAttribute, findProductAttributeById, findProductAttributeByNormalizedName, findProductAttributesByNormalizedNames, updateProductAttribute } from "#models/productAttribute.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import crypto from "crypto";
export const createProductAttributeService = async (data) => {
    const normalizedSet = new Set();
    for (const attribute of data.attributes) {
        const normalizedName = normalizeText(attribute.attributeName);
        if (normalizedSet.has(normalizedName)) {
            throw new AppError(`Thuộc tính ${attribute.attributeName} bị trùng trong request`, 400);
        }
        normalizedSet.add(normalizedName);
    }
    const normalizedNames = [...normalizedSet];
    const existedAttributes = await findProductAttributesByNormalizedNames(normalizedNames);
    if (existedAttributes.length > 0)
        throw new AppError("Có thuộc tính đã tồn tại", 409);
    const productAttributeData = data.attributes.map((item) => ({
        attribute_id: crypto.randomUUID(),
        attribute_name: item.attributeName,
        normalized_name: normalizeText(item.attributeName),
        display_order: item.displayOrder ?? 0,
    }));
    await createProductAttributes(productAttributeData);
    return { productAttributeData };
};
export const getAllProductAttributesService = async () => {
    const productAttributes = await findAllProductAttribute();
    return { productAttributes };
};
export const getProductAttributeService = async (attributeId) => {
    const productAttribute = await findProductAttributeById(attributeId);
    if (!productAttribute)
        throw new AppError("Không tìm thấy thuộc tính sản phẩm", 404);
    return { productAttribute };
};
export const updateProductAttributeService = async (attributeId, payload) => {
    const productAttribute = await findProductAttributeById(attributeId);
    if (!productAttribute)
        throw new AppError("Không tìm thấy mã thuộc tính sản phẩm", 404);
    const productAttributeData = {};
    if (payload.attributeName !== undefined) {
        const normalizedName = normalizeText(payload.attributeName);
        const existedProductAttribute = await findProductAttributeByNormalizedName(normalizedName);
        if (existedProductAttribute && existedProductAttribute.attribute_id !== attributeId) {
            throw new AppError("Tên thuộc tính đã tồn tại", 409);
        }
        productAttributeData.attribute_name = payload.attributeName;
        productAttributeData.normalized_name = normalizedName;
    }
    if (payload.displayOrder !== undefined)
        productAttributeData.display_order = payload.displayOrder;
    const updProductAttribute = await updateProductAttribute(attributeId, productAttributeData);
    return { updProductAttribute };
};
export const deleteProductAttributeService = async (attributeId) => {
    const productAttribute = await findProductAttributeById(attributeId);
    if (!productAttribute)
        throw new AppError("Không tìm thấy mã thuộc tính cần xóa", 404);
    const existedAttributeValue = await findAttributeValueByProductAttributeId(attributeId);
    if (existedAttributeValue)
        throw new AppError("Thuộc tính này đang có giá trị không thể xóa", 409);
    const delProductAttribute = await deleteProductAttribute(attributeId);
    return { delProductAttribute };
};
