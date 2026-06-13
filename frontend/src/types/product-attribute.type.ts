import type { ProductAttributeValue } from "./attribute-value.type";

export type ProductAttribute = {
    attribute_id: string;
    attribute_name: string;
    normalized_name: string;
    display_order: number;
    attribute_values: ProductAttributeValue[];
};

export type ProductAttributeListData = {
    productAttributes: ProductAttribute[];
};

export type ProductAttributePayload = {
    attributes: Array<{
        attributeName: string;
        displayOrder?: number;
    }>;
};

export type ProductAttributeUpdatePayload = {
    attributeName?: string;
    displayOrder?: number;
}