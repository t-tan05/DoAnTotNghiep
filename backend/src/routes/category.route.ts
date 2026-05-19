import { createCategoryController, getAllCategoriesController, getCategoryByIdController } from "#controllers/category.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Router } from "express";

const router = Router();

router.post("/", VerifyToken, CheckRole("ADMIN"), createCategoryController);
router.get("/", VerifyToken, CheckRole("ADMIN"), getAllCategoriesController);
router.get("/:categoryId", VerifyToken, CheckRole("ADMIN"), getCategoryByIdController);

export default router;