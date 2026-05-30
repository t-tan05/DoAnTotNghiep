import { findAttributeValuesByIds } from "#models/attributeValue.model";
import { findProductById } from "#models/product.model";
import { createProductVariants, findProductVariantById, findProductVariantBySku, updateProductVariant } from "#models/productVariant.model";
import AppError from "#utils/AppError";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "#utils/UploadCloud";
import { inventory_transactions_type } from "@prisma/client";
import crypto from "crypto";

export const createProductVariantService = async(
    productId: string,
    data: any,
    files: Express.Multer.File[],
    createdBy?: string
) => {
    const product = await findProductById(productId);

    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    const skuSet = new Set<string>();

    const productVariantData = [];
    const variantAttributeValueData = [];
    const productVariantSpecData = [];
    const productImageData = [];
    const inventoryTransactionData = [];
    const uploadedPublicIds: string[] = [];
    const matchedImageFieldnames = new Set<string>();

    try{
        for(let index = 0; index < data?.variants.length; index++){
            const variant = data?.variants[index];

            if(skuSet.has(variant?.sku)) {
                throw new AppError(`SKU ${variant?.sku} bị trùng trong request`, 400);
            }

            skuSet.add(variant?.sku);

            const existedSku = await findProductVariantBySku(variant?.sku);

            if(existedSku) throw new AppError(`SKU ${variant?.sku} đã tồn tại`, 409);

            const variantId = crypto.randomUUID();

            productVariantData.push({
                variant_id: variantId,
                product_id: productId,
                sku: variant?.sku,
                price: variant?.price,
                quantity_in_stock: variant?.quantityInStock,
                reserved_quantity: 0,
                sold_quantity: 0,
            });

            if(variant.attributeValueIds){
                const existedAttributeValues = await findAttributeValuesByIds(variant.attributeValueIds);

                if(existedAttributeValues.length !== variant.attributeValueIds.length){
                    throw new AppError("Có giá trị thuộc tính không tồn tại", 404);
                }

                for(const attributeValueId of variant?.attributeValueIds){
                    variantAttributeValueData.push({
                        variant_id: variantId,
                        attribute_value_id: attributeValueId,
                    });
                }
            }


            for(let i = 0; i < variant?.specs.lenght; i++){
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

            const variantImages = files.filter((file) => {
                return file.fieldname.startsWith(`variant_${index}_image`);
            });
            
            variantImages.forEach((file) => matchedImageFieldnames.add(file.fieldname));

            for(let i = 0; i < variantImages.length; i++){
                const uploadResult = await uploadImageToCloudinary(
                    variantImages[i],
                    "DoAnTotNghiep/products"
                );

                uploadedPublicIds.push(uploadResult.public_id);
                
                productImageData.push({
                    product_id: productId,
                    variant_id: variantId,
                    image_url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                    is_default: i === 0,
                });
            }
        }

        const unmatchedFileFieldnames = files
            .map((file) => file.fieldname)
            .filter((fieldname) => !matchedImageFieldnames.has(fieldname));

        if(unmatchedFileFieldnames.length > 0){
            throw new AppError(
                `Tên field ảnh không hợp lệ: ${unmatchedFileFieldnames.join(", ")}. Định dạng đúng là variant_{index}_image_{number}, ví dụ variant_0_image_0`,
                400
            );
        }

        await createProductVariants(
            productVariantData,
            variantAttributeValueData,
            productVariantSpecData,
            productImageData,
            inventoryTransactionData,
        );

        return true;

    }catch(error){
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) => deleteImageFromCloudinary(publicId))
        );

        throw error;
    }
};

export const updateProductVariantService = async(
    variantId: string,
    data: any,
) => {
    const productVariant = await findProductVariantById(variantId);

    if(!productVariant) throw new AppError("Không tìm thấy biến thể sản phẩm", 400);

    if(data.sku){
        const existedVariant = await findProductVariantBySku(data?.sku);
    
        if(existedVariant && existedVariant.variant_id !== variantId){
            throw new AppError(`SKU ${data.sku} đã tồn tại`, 409);
        } 
    }

    if(data.attributeValueIds){
        const existedAttributeValue = await findAttributeValuesByIds(data.attributeValueIds);

        if(existedAttributeValue.length !== data?.attributeValueIds.length){
            throw new AppError("Có giá trị thuộc tính không tồn tại", 404);
        }
    }

    const productVariantData: any = {};

    if(data.sku) productVariantData.sku = data.sku;

    if(data.price) productVariantData.price = data.price;

    if(data.quantityInStock) productVariantData.quantity_in_stock = data.quantityInStock;

    const variantAttributeValueData = [];

    if(data?.attributeValueIds){
        for(const attributeValueId of data?.attributeValueIds){
            variantAttributeValueData.push({
                variant_id: variantId,
                attribute_value_id: attributeValueId,
            });
        }
    }

    const productVariantSpecData = [];

    if(data?.specs){
        for(let i = 0; i < data?.specs.length; i++){
            productVariantSpecData.push({
                variant_id: variantId,
                spec_key: data?.specs[i]?.specKey,
                spec_value: data?.specs[i]?.specValue,
                display_order: i,
            });
        }
    }
    
    const updProductVariant = await updateProductVariant(
        variantId,
        productVariantData,
        data?.attributeValueIds !== undefined,
        variantAttributeValueData,
        data?.specs !== undefined,
        productVariantSpecData,
    );

    return { updProductVariant };
}

export const getProductVariantService = async(variantId: string) => {
    const productVariant = await findProductVariantById(variantId);

    if(!productVariant) throw new AppError("Không tìm thấy biến thể sản phẩm", 404);

    return {productVariant};
}



