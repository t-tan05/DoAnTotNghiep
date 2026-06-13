export interface ProductVariantSpecPayload {
    specKey: string;
    specValue: string;
}

export interface ProductVariantPayload {
    sku: string;
    price: number;
    quantityInStock: number;
    attributeValueIds: string[];
    specs: ProductVariantSpecPayload[];
    imageUrl?: string | null;
    publicId?: string | null;
}

export interface CreateProductPayload {
    productName: string;
    brandId: string;
    categoryId: string;
    description?: string | null;
    warrantyPeriod: number;
}

export interface UpdateProductPayload {
    productName?: string;
    brandId?: string;
    categoryId?: string;
    description?: string | null;
    warrantyPeriod?: number;
}

export interface CreateProductVariantPayload {
    variants: ProductVariantPayload[];
}

export interface UpdateProductVariantPayload {
    sku?: string;
    price?: number;
    quantityInStock?: number;
    stockNote?: string | null;
    attributeValueIds?: string[];
    specs?: ProductVariantSpecPayload[];
}
