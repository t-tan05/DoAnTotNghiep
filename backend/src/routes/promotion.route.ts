import {
    attachProductsToPromotionController,
    createPromotionController,
    deletePromotionController,
    detachProductFromPromotionController,
    getAllPromotionsController,
    getPromotionByIdController,
    updatePromotionController,
} from "#controllers/promotion.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Validate } from "#middlewares/Validate";
import {
    attachProductsToPromotionSchema,
    createPromotionSchema,
    updatePromotionSchema,
} from "#validations/promotion.validation";
import { Router } from "express";

const router = Router();

router.get("/", VerifyToken, CheckRole("ADMIN"), getAllPromotionsController);
router.get("/:promotionId", VerifyToken, CheckRole("ADMIN"), getPromotionByIdController);
router.post("/", VerifyToken, CheckRole("ADMIN"), Validate(createPromotionSchema), createPromotionController);
router.patch("/:promotionId", VerifyToken, CheckRole("ADMIN"), Validate(updatePromotionSchema), updatePromotionController);
router.delete("/:promotionId", VerifyToken, CheckRole("ADMIN"), deletePromotionController);
router.post("/:promotionId/products", VerifyToken, CheckRole("ADMIN"), Validate(attachProductsToPromotionSchema), attachProductsToPromotionController);
router.delete("/:promotionId/products/:productId", VerifyToken,CheckRole("ADMIN"), detachProductFromPromotionController);

export default router;