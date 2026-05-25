import { createAttributeValueService, updateAttributeValueService } from "#services/attributeValue.service";
import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";

export const createAttributeValueController = CatchAsync(async(req: Request, res: Response) => {
    const data = await createAttributeValueService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo giá trị thuộc tính thành công",
        data: {
            ...data,
        },
    });
});

export const updateAttributeValueController = CatchAsync(async(req: Request, res: Response) => {
    const attributeValueId = req.params?.attributeValueId as string;
    const {value, displayOrder} = req.body;

    const data = await updateAttributeValueService(attributeValueId, value, displayOrder);

    res.status(200).json({
        success: true,
        message: "Cập nhật giá trị thuộc tính thành công",
        data: {
            ...data,
        },
    });
});

