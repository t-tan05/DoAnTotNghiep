import { Router } from "express";
import { VerifyToken } from "#middlewares/Auth";
import { Validate } from "#middlewares/Validate";
import {
    createReviewController,
    getAdminReviewsController,
    getProductReviewsController,
} from "#controllers/review.controller";
import { createReviewSchema } from "#validations/review.validation";
import { CheckRole } from "#middlewares/CheckRole";

const router = Router();

router.post("/", VerifyToken, Validate(createReviewSchema), createReviewController);

router.get("/products/:productId", getProductReviewsController);
router.get("/admin", VerifyToken, CheckRole("ADMIN"), getAdminReviewsController);

export default router;