import { createProductService } from "#services/product.service";
import { CatchAsync } from "#utils/CatchAsync";
export const createProductController = CatchAsync(async (req, res) => {
    const userId = req.user.user_id;
    const files = req.files ?? [];
    const result = await createProductService(req.body, files, userId);
    return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: {
            ...result,
        },
    });
});
