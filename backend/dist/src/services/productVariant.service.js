import { findAttributeValuesByIds } from "#models/attributeValue.model";
import { findProductById } from "#models/product.model";
import { createProductVariants, deleteProductVariant, findProductVariantById, findProductVariantBySku, findProductVariantCombosByProductId, updateProductVariant } from "#models/productVariant.model";
import AppError from "#utils/AppError";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "#utils/UploadCloud";
import { devices_status, inventory_transactions_type } from "@prisma/client";
import crypto from "crypto";
const buildVariantComboKey = (attributeValueIds = []) => {
    return [...attributeValueIds].sort().join("|");
};
const buildExistingVariantComboSet = async (productId, excludedVariantId) => {
    const variants = await findProductVariantCombosByProductId(productId);
    const comboSet = new Set();
    for (const variant of variants) {
        if (variant.variant_id === excludedVariantId)
            continue;
        const comboKey = buildVariantComboKey(variant.variant_attribute_values.map((item) => item.attribute_value_id));
        if (comboKey)
            comboSet.add(comboKey);
    }
    return comboSet;
};
export const createProductVariantService = async (productId, data, files, createdBy) => {
    const product = await findProductById(productId);
    if (!product)
        throw new AppError("Không tìm thấy sản phẩm", 404);
    const skuSet = new Set();
    const variantComboSet = new Set();
    const existingVariantComboSet = await buildExistingVariantComboSet(productId);
    const productVariantData = [];
    const variantAttributeValueData = [];
    const productVariantSpecData = [];
    const productImageData = [];
    const inventoryTransactionData = [];
    const uploadedPublicIds = [];
    const matchedImageFieldnames = new Set();
    const deviceData = [];
    try {
        for (let index = 0; index < data?.variants.length; index++) {
            const variant = data?.variants[index];
            if (skuSet.has(variant?.sku)) {
                throw new AppError(`SKU ${variant?.sku} bị trùng trong request`, 400);
            }
            skuSet.add(variant?.sku);
            const comboKey = buildVariantComboKey(variant.attributeValueIds);
            if (comboKey && variantComboSet.has(comboKey)) {
                throw new AppError("Có biến thể bị trùng tổ hợp thuộc tính", 400);
            }
            if (comboKey && existingVariantComboSet.has(comboKey)) {
                throw new AppError("Tổ hợp thuộc tính của biến thể đã tồn tại trong sản phẩm", 409);
            }
            if (comboKey) {
                variantComboSet.add(comboKey);
            }
            const existedSku = await findProductVariantBySku(variant?.sku);
            if (existedSku)
                throw new AppError(`SKU ${variant?.sku} đã tồn tại`, 409);
            const variantId = crypto.randomUUID();
            let defaultImageUrl = null;
            let defaultPublicId = null;
            if (variant.attributeValueIds) {
                const existedAttributeValues = await findAttributeValuesByIds(variant.attributeValueIds);
                const attributeIds = existedAttributeValues.map((item) => item.attribute_id);
                const uniqueAttributeIds = new Set(attributeIds);
                if (uniqueAttributeIds.size !== attributeIds.length) {
                    throw new AppError("Một biến thể không được có nhiều giá trị cùng một thuộc tính.", 400);
                }
                if (existedAttributeValues.length !== variant.attributeValueIds.length) {
                    throw new AppError("Có giá trị thuộc tính không tồn tại", 404);
                }
                for (const attributeValueId of variant?.attributeValueIds) {
                    variantAttributeValueData.push({
                        variant_id: variantId,
                        attribute_value_id: attributeValueId,
                    });
                }
            }
            for (let i = 0; i < variant?.specs.length; i++) {
                productVariantSpecData.push({
                    variant_id: variantId,
                    spec_key: variant?.specs[i]?.specKey,
                    spec_value: variant?.specs[i]?.specValue,
                    display_order: i
                });
            }
            inventoryTransactionData.push({
                transaction_id: crypto.randomUUID(),
                variant_id: variantId,
                type: inventory_transactions_type.IMPORT,
                quantity: variant?.quantityInStock,
                before_quantity: 0,
                after_quantity: variant?.quantityInStock,
                note: "Nhập kho khi thêm biến thể",
                created_by: createdBy,
                created_at: new Date(Date.now()),
            });
            //Tự động tạo các devices cho từng product
            for (let i = 0; i < variant.quantityInStock; i++) {
                deviceData.push({
                    device_id: crypto.randomUUID(),
                    variant_id: variantId,
                    serial_number: `${variant.sku}-${Date.now()}-${i + 1}`,
                    status: devices_status.AVAILABLE,
                });
            }
            const variantImages = files.filter((file) => {
                return file.fieldname.startsWith(`variant_${index}_image`);
            });
            variantImages.forEach((file) => matchedImageFieldnames.add(file.fieldname));
            for (let i = 0; i < variantImages.length; i++) {
                const uploadResult = await uploadImageToCloudinary(variantImages[i], "DoAnTotNghiep/products");
                uploadedPublicIds.push(uploadResult.public_id);
                if (i === 0) {
                    defaultImageUrl = uploadResult.secure_url;
                    defaultPublicId = uploadResult.public_id;
                }
                productImageData.push({
                    product_id: productId,
                    variant_id: variantId,
                    image_url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                    is_default: i === 0,
                });
            }
            productVariantData.push({
                variant_id: variantId,
                product_id: productId,
                sku: variant?.sku,
                variant_name: variant?.variantName?.trim() || null,
                detail_description: variant?.detailDescription?.trim() || null,
                price: variant?.price,
                quantity_in_stock: variant?.quantityInStock,
                reserved_quantity: 0,
                sold_quantity: 0,
                image_url: defaultImageUrl,
                public_id: defaultPublicId,
            });
        }
        const unmatchedFileFieldnames = files
            .map((file) => file.fieldname)
            .filter((fieldname) => !matchedImageFieldnames.has(fieldname));
        if (unmatchedFileFieldnames.length > 0) {
            throw new AppError(`Tên field ảnh không hợp lệ: ${unmatchedFileFieldnames.join(", ")}. Định dạng đúng là variant_{index}_image_{number}, ví dụ variant_0_image_0`, 400);
        }
        await createProductVariants(productVariantData, variantAttributeValueData, productVariantSpecData, productImageData, inventoryTransactionData, deviceData);
        return { created: true };
    }
    catch (error) {
        await Promise.allSettled(uploadedPublicIds.map((publicId) => deleteImageFromCloudinary(publicId)));
        throw error;
    }
};
export const updateProductVariantService = async (variantId, data, updatedBy) => {
    const productVariant = await findProductVariantById(variantId);
    if (!productVariant)
        throw new AppError("Không tìm thấy biến thể sản phẩm", 400);
    if (data.sku !== undefined) {
        const existedVariant = await findProductVariantBySku(data?.sku);
        if (existedVariant && existedVariant.variant_id !== variantId) {
            throw new AppError(`SKU ${data.sku} đã tồn tại`, 409);
        }
    }
    if (data.attributeValueIds) {
        const attributeValueSet = new Set();
        //Kiểm tra request có gửi mã giá trị thuộc tính trùng nhau không
        for (const id of data?.attributeValueIds) {
            if (attributeValueSet.has(id)) {
                throw new AppError(`Mã giá trị thuôc tính ${id} bị trùng trong request`, 400);
            }
            attributeValueSet.add(id);
        }
        const existedAttributeValue = await findAttributeValuesByIds(data.attributeValueIds);
        const attributeIds = existedAttributeValue.map((item) => item.attribute_id);
        const uniqueAttributeIds = new Set(attributeIds);
        if (uniqueAttributeIds.size !== attributeIds.length) {
            throw new AppError("Một biến thể không được có nhiều giá trị cùng một thuộc tính.", 400);
        }
        if (existedAttributeValue.length !== data?.attributeValueIds.length) {
            throw new AppError("Có giá trị thuộc tính không tồn tại", 404);
        }
    }
    if (data.attributeValueIds) {
        const comboKey = buildVariantComboKey(data.attributeValueIds);
        const existingVariantComboSet = await buildExistingVariantComboSet(productVariant.product_id, variantId);
        if (comboKey && existingVariantComboSet.has(comboKey)) {
            throw new AppError("Tổ hợp thuộc tính của biến thể đã tồn tại trong sản phẩm", 409);
        }
    }
    const productVariantData = {};
    if (data.sku !== undefined)
        productVariantData.sku = data.sku;
    if (data.variantName !== undefined)
        productVariantData.variant_name = data.variantName?.trim() || null;
    if (data.detailDescription !== undefined)
        productVariantData.detail_description = data.detailDescription?.trim() || null;
    if (data.price !== undefined)
        productVariantData.price = data.price;
    let inventoryTransactionData;
    const deviceData = [];
    let deviceDecreaseQuantity = 0;
    if (data.quantityInStock !== undefined) {
        const stockDifference = data.quantityInStock - productVariant.quantity_in_stock;
        const nextSku = data.sku ?? productVariant.sku ?? variantId;
        productVariantData.quantity_in_stock = data.quantityInStock;
        inventoryTransactionData = {
            transaction_id: crypto.randomUUID(),
            variant_id: variantId,
            type: inventory_transactions_type.ADJUST,
            quantity: stockDifference,
            before_quantity: productVariant.quantity_in_stock,
            after_quantity: data.quantityInStock,
            note: data.stockNote || "Điều chỉnh tồn kho biến thể",
            created_by: updatedBy,
            created_at: new Date(),
        };
        if (stockDifference > 0) {
            const createdAt = Date.now();
            for (let i = 0; i < stockDifference; i++) {
                deviceData.push({
                    device_id: crypto.randomUUID(),
                    variant_id: variantId,
                    serial_number: `${nextSku}-${createdAt}-${productVariant.quantity_in_stock + i + 1}`,
                    status: devices_status.AVAILABLE,
                });
            }
        }
        if (stockDifference < 0) {
            deviceDecreaseQuantity = Math.abs(stockDifference);
        }
    }
    const variantAttributeValueData = [];
    if (data?.attributeValueIds) {
        for (const attributeValueId of data?.attributeValueIds) {
            variantAttributeValueData.push({
                variant_id: variantId,
                attribute_value_id: attributeValueId,
            });
        }
    }
    const productVariantSpecData = [];
    if (data?.specs) {
        for (let i = 0; i < data?.specs.length; i++) {
            productVariantSpecData.push({
                variant_id: variantId,
                spec_key: data?.specs[i]?.specKey,
                spec_value: data?.specs[i]?.specValue,
                display_order: i,
            });
        }
    }
    const updProductVariant = await updateProductVariant(variantId, productVariantData, data?.attributeValueIds !== undefined, variantAttributeValueData, data?.specs !== undefined, productVariantSpecData, inventoryTransactionData, deviceData, deviceDecreaseQuantity);
    return { updProductVariant };
};
export const getProductVariantService = async (variantId) => {
    const productVariant = await findProductVariantById(variantId);
    if (!productVariant)
        throw new AppError("Không tìm thấy biến thể sản phẩm", 404);
    return { productVariant };
};
export const deleteProductVariantService = async (variantId) => {
    const variant = await findProductVariantById(variantId);
    if (!variant)
        throw new AppError("Không tìm thấy biến thể sản phẩm", 404);
    const delVariant = await deleteProductVariant(variantId);
    return { delVariant };
};
