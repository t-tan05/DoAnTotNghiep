import { Request, Response } from "express";
import {CatchAsync} from "#utils/CatchAsync";
import { 
    createCmsCollectionService, 
    createCmsRuleService,
    bulkCreateCmsSectionItemsService,
    createCmsSectionItemService,
    createCmsSectionService,
    deleteCmsCollectionService, 
    deleteCmsRuleService,
    deleteCmsSectionItemService,
    deleteCmsSectionService,
    getAdminCmsCollectionDetailService, 
    getAdminCmsCollectionsService, 
    getPublicCmsCollectionFiltersService, 
    getPublicCmsCollectionProductsService, 
    getPublicCmsCollectionService, 
    updateCmsCollectionService,
    updateCmsRuleService,
    updateCmsSectionItemService,
    updateCmsSectionService
} from "#services/cms.service";

export const getPublicCmsCollectionController = CatchAsync(async (req: Request, res: Response) => {
    const slug  = req.params.slug as string;

    const data = await getPublicCmsCollectionService(slug);

    res.status(200).json({
        success: true,
        message: "Lấy dữ liệu CMS thành công.",
        data: {
            ...data,
        },
    });
});

export const getPublicCmsCollectionProductsController = CatchAsync(async (req: Request, res: Response) => {
    const slug  = req.params.slug as string;

    const data = await getPublicCmsCollectionProductsService(slug, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        brandId: req.query.brandId as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        sortBy: req.query.sortBy as any,
        attributeValueIds: req.query.attributeValueIds
            ? String(req.query.attributeValueIds).split(",").filter(Boolean)
            : undefined,
    });

    res.status(200).json({
        success: true,
        message: "Lấy sản phẩm CMS thành công.",
        data: {
            ...data
        },
    });
});

export const getPublicCmsCollectionFiltersController = CatchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;

    const data = await getPublicCmsCollectionFiltersService(slug);

    res.status(200).json({
        success: true,
        message: "Lấy bộ lọc CMS thành công.",
        data: {
            ...data
        },
    });
    }
);

export const getAdminCmsCollectionsController = CatchAsync(async(req: Request, res: Response) => {
    const data = await getAdminCmsCollectionsService({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string | undefined,
        pageType: req.query.pageType as any,
        isActive: req.query.isActive !== undefined ? String(req.query.isActive) === "true" : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách CMS collection thành công.",
        data: {
            ...data
        },
    });
});

export const getAdminCmsCollectionDetailController = CatchAsync(async(req: Request, res: Response) => {
    const collectionId = req.params.collectionId as string;

    const data = await getAdminCmsCollectionDetailService(collectionId);

    res.status(200).json({
        success: true,
        message: "Lấy chi tiết CMS collection thành công.",
        data: {
            ...data
        },
    });
});

export const createCmsCollectionController = CatchAsync(async(req: Request, res: Response) => {
    const data = await createCmsCollectionService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo CMS collection thành công.",
        data: {
            ...data
        },
    });
});

export const updateCmsCollectionController = CatchAsync(async(req: Request, res: Response) => {
    const collectionId = req.params.collectionId as string;

    const data = await updateCmsCollectionService(collectionId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật CMS collection thành công.",
        data: {
            ...data
        },
    });
});

export const deleteCmsCollectionController = CatchAsync(async(req: Request, res: Response) => {
    const collectionId = req.params.collectionId as string;

    const data = await deleteCmsCollectionService(collectionId);

    res.status(200).json({
        success: true,
        message: "Xóa CMS collection thành công.",
        data: {
            ...data
        },
    });
});

export const createCmsSectionController = CatchAsync(async(req: Request, res: Response) => {
    const collectionId = req.params.collectionId as string;
    const data = await createCmsSectionService(collectionId, req.body);

    res.status(201).json({
        success: true,
        message: "Tạo CMS section thành công.",
        data: {
            ...data
        },
    });
});

export const updateCmsSectionController = CatchAsync(async(req: Request, res: Response) => {
    const sectionId = req.params.sectionId as string;
    const data = await updateCmsSectionService(sectionId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật CMS section thành công.",
        data: {
            ...data
        },
    });
});

export const deleteCmsSectionController = CatchAsync(async(req: Request, res: Response) => {
    const sectionId = req.params.sectionId as string;
    const data = await deleteCmsSectionService(sectionId);

    res.status(200).json({
        success: true,
        message: "Xóa CMS section thành công.",
        data: {
            ...data
        },
    });
});

export const createCmsSectionItemController = CatchAsync(async(req: Request, res: Response) => {
    const sectionId = req.params.sectionId as string;
    const data = await createCmsSectionItemService(sectionId, req.body);

    res.status(201).json({
        success: true,
        message: "Tạo CMS section item thành công.",
        data: {
            ...data
        },
    });
});

export const bulkCreateCmsSectionItemsController = CatchAsync(async(req: Request, res: Response) => {
    const sectionId = req.params.sectionId as string;
    const data = await bulkCreateCmsSectionItemsService(sectionId, req.body);

    res.status(201).json({
        success: true,
        message: "Tạo nhiều CMS section item thành công.",
        data: {
            ...data
        },
    });
});

export const updateCmsSectionItemController = CatchAsync(async(req: Request, res: Response) => {
    const itemId = req.params.itemId as string;
    const data = await updateCmsSectionItemService(itemId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật CMS section item thành công.",
        data: {
            ...data
        },
    });
});

export const deleteCmsSectionItemController = CatchAsync(async(req: Request, res: Response) => {
    const itemId = req.params.itemId as string;
    const data = await deleteCmsSectionItemService(itemId);

    res.status(200).json({
        success: true,
        message: "Xóa CMS section item thành công.",
        data: {
            ...data
        },
    });
});

export const createCmsRuleController = CatchAsync(async(req: Request, res: Response) => {
    const collectionId = req.params.collectionId as string;
    const data = await createCmsRuleService(collectionId, req.body);

    res.status(201).json({
        success: true,
        message: "Tạo CMS rule thành công.",
        data: {
            ...data
        },
    });
});

export const updateCmsRuleController = CatchAsync(async(req: Request, res: Response) => {
    const ruleId = req.params.ruleId as string;
    const data = await updateCmsRuleService(ruleId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật CMS rule thành công.",
        data: {
            ...data
        },
    });
});

export const deleteCmsRuleController = CatchAsync(async(req: Request, res: Response) => {
    const ruleId = req.params.ruleId as string;
    const data = await deleteCmsRuleService(ruleId);

    res.status(200).json({
        success: true,
        message: "Xóa CMS rule thành công.",
        data: {
            ...data
        },
    });
});
