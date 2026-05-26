import { createAttributeValueService, deleteAttributeValueService, updateAttributeValueService } from "#services/attributeValue.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createAttributeValueController = CatchAsync(async (req, res) => {
    const data = await createAttributeValueService(req.body);
    res.status(201).json({
        success: true,
        message: "Tạo giá trị thuộc tính thành công",
        data: {
            ...data,
        },
    });
});
export const updateAttributeValueController = CatchAsync(async (req, res) => {
    const attributeValueId = req.params?.attributeValueId;
    const { value, displayOrder } = req.body;
    const data = await updateAttributeValueService(attributeValueId, value, displayOrder);
    res.status(200).json({
        success: true,
        message: "Cập nhật giá trị thuộc tính thành công",
        data: {
            ...data,
        },
    });
});
export const deleteAttributeValueController = CatchAsync(async (req, res) => {
    const attributeValueId = req.params?.attributeValueId;
    const data = await deleteAttributeValueService(attributeValueId);
    res.status(200).json({
        success: true,
        message: "Xóa giá trị thuộc tính thành công",
        data: {
            ...data,
        },
    });
});
