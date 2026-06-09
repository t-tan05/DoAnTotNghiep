export interface CreateProductAttributePayload {
    attributes: {
        attributeName: string;
        displayOrder?: number;
    }[];
}

export interface UpdateProductAttributePayload {
    attributeName?: string;
    displayOrder?: number;
}
