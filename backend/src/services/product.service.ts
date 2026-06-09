import { findAttributeValuesByIds } from "#models/attributeValue.model";
import { findBrandById } from "#models/brand.model";
import { findCategoryById } from "#models/category.model";
import { createProduct, findProductById, findProductByNormalizeName, getAllProducts, updateProduct } from "#models/product.model"
import { findProductVariantBySku } from "#models/productVariant.model";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "#utils/UploadCloud";
import crypto from "crypto";
import { inventory_transactions_type, Prisma } from "@prisma/client";
import type { CreateProductPayload, UpdateProductPayload } from "#types/product.type";

const buildVariantComboKey = (attributeValueIds: string[] = []) => {
    return [...attributeValueIds].sort().join("|");
};

export const createProductService = async(data: CreateProductPayload, files: Express.Multer.File[], createdBy?: string) => {

    //tên hiển thị
    const displayName = data?.productName;

    //Tên được chuẩn hóa
    const nomarlizedName = normalizeText(displayName);

    //Kiểm tra tên sản phẩm đã tồn tại chưa
    const existedProduct = await findProductByNormalizeName(nomarlizedName);
    if(existedProduct) throw new AppError("Tên sản phẩm đã tồn tại", 409);

    const brand = await findBrandById(data?.brandId);

    //Kiểm tra brand có tồn tại không
    if(!brand) throw new AppError("Thương hiệu không tồn tại", 404);

    const category = await findCategoryById(data?.categoryId);

    //Kiểm tra category có tồn tại không
    if(!category) throw new AppError("Danh mục không tồn tại", 404);

    const skuSet = new Set<string>();
    const variantComboSet = new Set<string>();
    const allAttributeValueIds: string[] = [];

    for(const variant of data?.variants){

        if(skuSet.has(variant?.sku)){
            throw new AppError(`SKU ${variant?.sku} bị trùng trong request`, 400);
        }

        skuSet.add(variant?.sku);

        const comboKey = buildVariantComboKey(variant.attributeValueIds);

        if(comboKey && variantComboSet.has(comboKey)) {
            throw new AppError("Có biến thể bị trùng tổ hợp thuộc tính", 400);
        }

        if(comboKey){
            variantComboSet.add(comboKey);
        }

        const existedSku = await findProductVariantBySku(variant?.sku);

        if(existedSku) throw new AppError(`SKU ${variant?.sku} đã tồn tại`, 409);

        allAttributeValueIds.push(...(variant?.attributeValueIds ?? []));
    }

    const uniqueAttributeValueIds = [...new Set(allAttributeValueIds)];

    const existedAttributeValues = await findAttributeValuesByIds(uniqueAttributeValueIds);

    if(existedAttributeValues.length !== uniqueAttributeValueIds.length) {
        throw new AppError("Có giá trị thuộc tính không tồn tại", 404);
    }

    const attributeValueAttributeMap = new Map(
        existedAttributeValues.map((item) => [item.attribute_value_id, item.attribute_id])
    );

    const productId = crypto.randomUUID();

    const productData = {
        product_id: productId,
        product_name: data?.productName,
        normalized_name: nomarlizedName,
        brand_id: data?.brandId,
        category_id: data?.categoryId,
        description: data?.description ?? null,
        warranty_period: data?.warrantyPeriod,
    };

    const productVariantData = [];
    const inventoryData = [];
    const variantAttributeData = [];
    const productVariantSpecData = [];
    const imageData = [];
    const uploadedPublicIds: string[] = [];
    const matchedImageFieldnames = new Set<string>();

    try{
        for(let index = 0; index < data?.variants.length; index++){

            const variant = data?.variants[index];
            const variantId = crypto.randomUUID();
            const attributeIds = variant.attributeValueIds
                .map((attributeValueId) => attributeValueAttributeMap.get(attributeValueId))
                .filter((attributeId): attributeId is string => attributeId !== undefined);
            const uniqueAttributeIds = new Set(attributeIds);

            if(uniqueAttributeIds.size !== attributeIds.length){
                throw new AppError("Một biến thể không được có nhiều giá trị cùng một thuộc tính.", 400);
            }

            productVariantData.push({
                variant_id: variantId,
                product_id: productId,
                sku: variant?.sku,
                price: variant?.price,
                quantity_in_stock: variant?.quantityInStock,
                reserved_quantity: 0,
                sold_quantity: 0,
                image_url: variant?.imageUrl ?? null,
                public_id: variant?.publicId ?? null,
            });

            for(const attributeValueId of variant?.attributeValueIds ?? []){
                variantAttributeData.push({
                    variant_id: variantId,
                    attribute_value_id: attributeValueId
                });
            }

            for(let i = 0; i < variant?.specs.length; i++){
                productVariantSpecData.push({
                    variant_id: variantId,
                    spec_key: variant?.specs[i]?.specKey,
                    spec_value: variant?.specs[i]?.specValue,
                    display_order: i
                });
            }

            inventoryData.push({
                transaction_id: crypto.randomUUID(),
                variant_id: variantId,
                type: inventory_transactions_type.IMPORT,
                quantity: variant?.quantityInStock,
                before_quantity: 0,
                after_quantity: variant?.quantityInStock,
                note: "Nhập kho khi tạo sản phẩm",
                created_at: new Date(Date.now()),
                created_by: createdBy,
            })

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

                imageData.push({
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

        const newProduct = await createProduct(
            productData, 
            productVariantData,
            inventoryData,
            variantAttributeData,
            productVariantSpecData,
            imageData,
        );

        return {newProduct};
    }catch(error){
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) => deleteImageFromCloudinary(publicId))
        );

        throw error;
    }
};

export const getProductDetailService = async(productId: string) => {
    const product = await findProductById(productId);

    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    return {product};
};

export const getAllProductsService = async() => {
    const products = await getAllProducts();

    return {products};
};

export const updateProductService = async(productId: string, data: UpdateProductPayload) => {
    const product = await findProductById(productId);
 
    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);

    const productData: Prisma.productsUncheckedUpdateInput = {};

    if(data.productName !== undefined){
        const normalizedName = normalizeText(data.productName);
        const existedProduct = await findProductByNormalizeName(normalizedName);

        if(existedProduct && existedProduct.product_id !== productId){
            throw new AppError("Tên sản phẩm đã tồn tại", 409);
        }

        productData.product_name = data.productName;
        productData.normalized_name = normalizedName;
    }

    if(data.brandId !== undefined){
        const brand = await findBrandById(data.brandId);

        if(!brand) throw new AppError("Thương hiệu không tồn tại", 404);

        productData.brand_id = data.brandId;
    }

    if(data.categoryId !== undefined){
        const category = await findCategoryById(data.categoryId);

        if(!category) throw new AppError("Danh mục không tồn tại", 404);

        productData.category_id = data.categoryId;
    }

    if(data.description !== undefined) productData.description = data.description;

    if(data.warrantyPeriod !== undefined) productData.warranty_period = data.warrantyPeriod;

    const updProduct = await updateProduct(productId, productData);

    return {updProduct};
}
