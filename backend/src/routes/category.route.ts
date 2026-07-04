import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController } from "#controllers/category.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Router } from "express";

const router = Router();

router.post("/", VerifyToken, CheckRole("ADMIN"), createCategoryController);
router.get("/", VerifyToken, getAllCategoriesController);
router.get("/:categoryId", VerifyToken, getCategoryByIdController);
router.patch("/:categoryId", VerifyToken, CheckRole("ADMIN"), updateCategoryController);
router.delete("/:categoryId", VerifyToken, CheckRole("ADMIN"), deleteCategoryController);

export default router;