import { api } from "./api";

export const productImageService = {
    addVariantImages: async(variantId: string, files: File[]) => {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("images", file);
        });

        const res = await api.post(`/product-variants/${variantId}images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return res.data;
    },

    setDefault: async(imageId: number) => {
        const res = await api.patch(`/product-images/${imageId}/default`);
        return res.data;
    },

    remove: async(imageId: number) => {
        const res = await api.delete(`/product-images/${imageId}`);
        return res.data;
    },
};