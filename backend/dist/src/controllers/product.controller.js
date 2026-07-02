import { createProductService, deleteProductService, getAllProductsService, getProductDetailService, getPublicProductsService, updateProductService } from "#services/product.service";
import { importProductsFromExcelService } from "#services/productImport.service";
import { createProductImportTemplateService } from "#services/productImportTemplate.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
export const createProductController = CatchAsync(async (req, res) => {
    const data = await createProductService(req.body);
    res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const getProductDetailController = CatchAsync(async (req, res) => {
    const productId = req.params?.productId;
    const data = await getProductDetailService(productId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const getAllProductsController = CatchAsync(async (req, res) => {
    const query = {
        ...parseListQuery({
            query: req.query,
            allowedSortFields: ["product_name", "created_at", "warranty_period"],
            defaultSortBy: "created_at",
        }),
        brandId: typeof req.query.brandId === "string" ? req.query.brandId : undefined,
        categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
        lineId: typeof req.query.lineId === "string" ? req.query.lineId : undefined,
    };
    const data = await getAllProductsService(query);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: {
            ...data
        },
    });
});
export const deleteProductController = CatchAsync(async (req, res) => {
    const productId = req.params.productId;
    const data = await deleteProductService(productId);
    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const updateProductController = CatchAsync(async (req, res) => {
    const productId = req.params?.productId;
    const data = await updateProductService(productId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: {
            ...data,
        },
    });
});
export const importProductsFromExcelController = CatchAsync(async (req, res) => {
    const userId = req.user?.user_id;
    const data = await importProductsFromExcelService(req.file, userId);
    const hasErrors = data.errors && data.errors.length > 0;
    res.status(hasErrors ? 400 : 201).json({
        success: !hasErrors,
        message: hasErrors ? "File Excel có dữ liệu không hợp lệ" : "Import sản phẩm từ Excel thành công",
        data: {
            ...data,
        },
    });
});
export const downloadProductImportTemplateController = CatchAsync(async (req, res) => {
    const buffer = await createProductImportTemplateService();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="product-import-template.xlsx"');
    res.status(200).send(buffer);
});
const getPublicSortBy = (value) => {
    const allowed = ["newest", "price_asc", "price_desc", "name_asc"];
    return typeof value === "string" && allowed.includes(value)
        ? value
        : "newest";
};
export const getPublicProductsController = CatchAsync(async (req, res) => {
    const data = await getPublicProductsService({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
        brandId: typeof req.query.brandId === "string" ? req.query.brandId : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        sortBy: getPublicSortBy(req.query.sortBy),
    });
    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm public thành công.",
        data: {
            ...data,
        },
    });
});
