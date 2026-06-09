export interface CreateAttributeValuePayload {
    values: {
        attributeId: string;
        value: string;
        displayOrder?: number;
    }[];
};

export interface UpdateAttributeValuePayload {
    value?: string;
    displayOrder?: number;
}