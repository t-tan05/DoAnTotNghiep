import { createProductLineService, deleteProductLineService, getAllProductLinesService, getProductLineByIdService, updateProductLineService, } from "#services/productLine.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
const allowedSortFields = ["line_name", "display_order", "created_at"];
export const createProductLineController = CatchAsync(async (req, res) => {
    const data = await createProductLineService(req.body);
    res.status(201).json({
        success: true,
        message: "Tạo dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
export const getAllProductLinesController = CatchAsync(async (req, res) => {
    const query = parseListQuery({
        query: req.query,
        allowedSortFields,
        defaultSortBy: "line_name",
    });
    const data = await getAllProductLinesService({
        ...query,
        brandId: req.query.brandId,
        categoryId: req.query.categoryId,
        isActive: req.query.isActive !== undefined
            ? String(req.query.isActive) === "true"
            : undefined,
    });
    res.status(200).json({
        success: true,
        message: "Lấy danh sách dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
export const getProductLineByIdController = CatchAsync(async (req, res) => {
    const lineId = req.params.lineId;
    const data = await getProductLineByIdService(lineId);
    res.status(200).json({
        success: true,
        message: "Lấy dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
export const updateProductLineController = CatchAsync(async (req, res) => {
    const lineId = req.params.lineId;
    const data = await updateProductLineService(lineId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
export const deleteProductLineController = CatchAsync(async (req, res) => {
    const lineId = req.params.lineId;
    const data = await deleteProductLineService(lineId);
    res.status(200).json({
        success: true,
        message: "Xóa dòng sản phẩm thành công.",
        data: {
            ...data,
        },
    });
});
