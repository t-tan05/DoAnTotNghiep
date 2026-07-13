export type CreateGhnOrderItem = {
    name: string;
    quantity: number;
    price: number;
};

export type CreateGhnOrderPayload = {
    clientOrderCode: string;
    toName: string;
    toPhone: string;
    toAddress: string;
    toWardCode: string;
    toDistrictId: number;
    codAmount: number;
    content: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    items: CreateGhnOrderItem[];
};