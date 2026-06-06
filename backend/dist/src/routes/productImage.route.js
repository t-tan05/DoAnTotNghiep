import { deleteProductImageController, setDefaultProductImageController } from "#controllers/productImage.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Router } from "express";
const router = Router();
router.delete("/:imageId", VerifyToken, CheckRole("ADMIN"), deleteProductImageController);
router.patch("/:imageId/default", VerifyToken, CheckRole("ADMIN"), setDefaultProductImageController);
export default router;
