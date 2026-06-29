import { addWishlistService, checkManyWishlistsService, checkWishlistService, getMyWishlistsService, removeWishlistService, } from "#services/wishlist.service";
import { CatchAsync } from "#utils/CatchAsync";
export const getMyWishlistsController = CatchAsync(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const data = await getMyWishlistsService(req.user.user_id, page, limit);
    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm yêu thích thành công.",
        data: {
            ...data,
        },
    });
});
export const addWishlistController = CatchAsync(async (req, res) => {
    const data = await addWishlistService(req.user.user_id, req.params.variantId);
    res.status(201).json({
        success: true,
        message: "Thêm sản phẩm vào danh sách yêu thích thành công.",
        data: {
            ...data,
        },
    });
});
export const removeWishlistController = CatchAsync(async (req, res) => {
    const data = await removeWishlistService(req.user.user_id, req.params.variantId);
    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm khỏi danh sách yêu thích thành công.",
        data: {
            ...data,
        },
    });
});
export const checkWishlistController = CatchAsync(async (req, res) => {
    const data = await checkWishlistService(req.user.user_id, req.params.variantId);
    res.status(200).json({
        success: true,
        message: "Kiểm tra trạng thái yêu thích thành công",
        data,
    });
});
export const checkManyWishlistsController = CatchAsync(async (req, res) => {
    const variantIds = Array.isArray(req.body.variantIds) ? req.body.variantIds : [];
    const data = await checkManyWishlistsService(req.user.user_id, variantIds);
    res.status(200).json({
        success: true,
        message: "Kiểm tra danh sách trạng thái yêu thích thành công.",
        data,
    });
});
