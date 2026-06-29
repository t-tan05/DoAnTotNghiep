import { Router } from "express";
import { VerifyToken } from "#middlewares/Auth";
import { Validate } from "#middlewares/Validate";
import {
    createReviewController,
    getProductReviewsController,
} from "#controllers/review.controller";
import { createReviewSchema } from "#validations/review.validation";

const router = Router();

router.post("/", VerifyToken, Validate(createReviewSchema), createReviewController);

router.get("/products/:productId", getProductReviewsController);

export default router;