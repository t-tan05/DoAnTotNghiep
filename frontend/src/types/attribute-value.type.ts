export type ProductAttributeValue = {
    attribute_value_id: string;
    attribute_id: string;
    value: string;
    normalized_value: string;
    display_order: number;
};

export type CreateProductAttributeValuePayload = {
    values: Array<{
        attributeId: string;
        value: string;
        displayOrder: number;
    }>,
};


export type UpdateProductAttributeValuePayload = {
    value?: string;
    displayOrder?: number;
}
