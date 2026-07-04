import {
    createProductLineController,
    deleteProductLineController,
    getAllProductLinesController,
    getProductLineByIdController,
    updateProductLineController,
} from "#controllers/productLine.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Validate } from "#middlewares/Validate";
import {
    createProductLineSchema,
    updateProductLineSchema,
} from "#validations/productLine.validation";
import { Router } from "express";

const router = Router();

router.get("/", VerifyToken, getAllProductLinesController);
router.post("/", VerifyToken, CheckRole("ADMIN"), Validate(createProductLineSchema), createProductLineController);
router.get("/:lineId", VerifyToken, getProductLineByIdController);
router.patch("/:lineId", VerifyToken, CheckRole("ADMIN"), Validate(updateProductLineSchema), updateProductLineController);
router.delete("/:lineId", VerifyToken, CheckRole("ADMIN"), deleteProductLineController);

export default router;
