import { 
    createProductService, 
    deleteProductService, 
    getAllProductsService, 
    getProductDetailService, 
    getPublicProductsService, 
    getRelatedProductsService, 
    updateProductService 
} from "#services/product.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
    file?: Express.Multer.File;
}

export const createProductController = CatchAsync(async(req: Request, res: Response) => {
    const data = await createProductService(req.body);

    res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

export const getProductDetailController = CatchAsync(async(req: Request, res: Response) => {
    const productId = req.params?.productId as string;

    const data = await getProductDetailService(productId);

    res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: {
            ...data
        },
    });
});

export const getAllProductsController = CatchAsync(async(req: Request, res: Response) => {
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

export const deleteProductController = CatchAsync(async(req: Request, res: Response) => {
    const productId = req.params.productId as string;

    const data = await deleteProductService(productId);

    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

export const updateProductController = CatchAsync(async(req: Request, res: Response) => {
    const productId = req.params?.productId as string;
    const data = await updateProductService(productId, req.body);

    res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: {
            ...data,
        },
    });
});

const getPublicSortBy = (value: unknown) => {
    const allowed = ["newest", "price_asc", "price_desc", "name_asc", "promotion", "best_selling"];

    return typeof value === "string" && allowed.includes(value)
        ? value as any
        : "newest";
};

export const getPublicProductsController = CatchAsync(async(req: Request, res: Response) => {
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

export const getRelatedProductsController = CatchAsync(async(req: Request, res: Response) => {
    const productId = req.params.productId as string;

    const data = await getRelatedProductsService(productId);

    res.status(200).json({
        success: true,
        message: "Lấy sản phẩm liên quan thành công.",
        data: {
            ...data
        },
    });
});
