import { upload } from "#config/multer";
import { addVariantImageController } from "#controllers/productImage.controller";
import { createProductVariantController, getProductVariantController, updateProductVariantController } from "#controllers/productVariant.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { parseData } from "#middlewares/parseData";
import { Validate } from "#middlewares/Validate";
import { updateProductVariantSchema } from "#validations/productVariant.validation";
import { Router } from "express";

const router = Router();

router.post("/:productId", VerifyToken, CheckRole("ADMIN"), upload.any(),parseData ,createProductVariantController);
router.patch("/:variantId", VerifyToken, CheckRole("ADMIN"), Validate(updateProductVariantSchema), updateProductVariantController);
router.post("/:variantId/images", VerifyToken, CheckRole("ADMIN"), upload.any(), addVariantImageController);
router.get("/:variantId", VerifyToken, CheckRole("ADMIN"), getProductVariantController);

export default router;