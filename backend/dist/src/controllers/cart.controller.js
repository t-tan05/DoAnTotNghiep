import { addCartItemService, clearMyCartService, deleteCartItemService, getMyCartService, updateCartItemService, } from "#services/cart.service";
import { CatchAsync } from "#utils/CatchAsync";
export const getMyCartController = CatchAsync(async (req, res) => {
    const data = await getMyCartService(req.user.user_id);
    res.status(200).json({
        success: true,
        message: "Lấy giỏ hàng thành công",
        data,
    });
});
export const addCartItemController = CatchAsync(async (req, res) => {
    const data = await addCartItemService(req.user.user_id, req.body);
    res.status(201).json({
        success: true,
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        data,
    });
});
export const updateCartItemController = CatchAsync(async (req, res) => {
    const data = await updateCartItemService(req.user.user_id, req.params.cartItemId, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật giỏ hàng thành công",
        data,
    });
});
export const deleteCartItemController = CatchAsync(async (req, res) => {
    const data = await deleteCartItemService(req.user.user_id, req.params.cartItemId);
    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm khỏi giỏ hàng thành công",
        data,
    });
});
export const clearMyCartController = CatchAsync(async (req, res) => {
    const data = await clearMyCartService(req.user.user_id);
    res.status(200).json({
        success: true,
        message: "Xóa giỏ hàng thành công",
        data,
    });
});
