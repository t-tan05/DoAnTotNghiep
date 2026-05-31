import { createBrandController, deleteBrandController, getAllBrandsController, getBrandByIdController, updateBrandController } from "#controllers/brand.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Router } from "express";

const router = Router();

router.post("/", VerifyToken, CheckRole("ADMIN"), createBrandController);
router.get("/", VerifyToken, CheckRole("ADMIN"), getAllBrandsController);
router.get("/:brandId", VerifyToken, CheckRole("ADMIN"), getBrandByIdController);
router.patch("/:brandId", VerifyToken, CheckRole("ADMIN"), updateBrandController);
router.delete("/:brandId", VerifyToken, CheckRole("ADMIN"), deleteBrandController);

export default router;