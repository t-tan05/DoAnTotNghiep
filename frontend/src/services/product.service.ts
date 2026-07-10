import type { CreateProductPayload, ProductDetailData, ProductListData, ProductListQuery, PublicProductQuery, PublicProductsResponse, RelatedProductsResponse, UpdateProductPayload } from "@/types/product.type";
import { api } from "./api";
import type { BackendSuccess } from "@/types/api.type";

export type ProductImportError = {
    row: number;
    field: string;
    message: string;
};

export type ProductImportResult = {
    imported: boolean;
    totalRows: number;
    errors: ProductImportError[];
    createdProductCount?: number;
    createdVariantCount?: number;
    createdDeviceCount?: number;
};

export const productService = {
    getAll: async(query: ProductListQuery) => {
        const res = await api.get<BackendSuccess<ProductListData>>("/products", {
            params: query,
        });

        return res.data.data;
    },

    getAllPublic: async(query: PublicProductQuery) => {
        const res = await api.get<BackendSuccess<PublicProductsResponse>>(
            "/products/public",
            {
                params: query,
            }
        );

        if(!res.data.data) {
            throw new Error("Không lấy được danh sách sản phẩm.");
        }

        return res.data.data;
    },

    getById: async(productId: string) => {
        const res = await api.get<BackendSuccess<ProductDetailData>>(`/products/${productId}`);
        return res.data.data;
    },

    create: async(payload: CreateProductPayload) => {
        const res = await api.post("/products", payload);
        return res.data;
    },

    update: async(productId: string, payload: UpdateProductPayload) => {
        const res = await api.patch(`/products/${productId}`, payload);
        return res.data;
    },

    remove: async(productId: string) => {
        const res = await api.delete(`/products/${productId}`);
        return res.data;
    },

    getRelated: async(productId: string) => {
        const res = await api.get<BackendSuccess<RelatedProductsResponse>>(
            `/products/${productId}/related`
        );

        if(!res.data.data) {
            throw new Error("Không lấy được sản phẩm liên quan.");
        }

        return res.data.data;
    },
};
