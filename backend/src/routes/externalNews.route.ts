import {
    getExternalNewsController,
    getExternalNewsDetailController,
    getExternalNewsSourcesController,
    importExternalNewsController,
} from "#controllers/externalNews.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Validate } from "#middlewares/Validate";
import { importExternalNewsSchema } from "#validations/externalNews.validation";
import { Router } from "express";

const router = Router();

router.use(VerifyToken, CheckRole("ADMIN", "EMPLOYEE"));

router.get("/sources", getExternalNewsSourcesController);
router.get("/", getExternalNewsController);
router.get("/detail", getExternalNewsDetailController);
router.post("/import", CheckRole("EMPLOYEE"), Validate(importExternalNewsSchema), importExternalNewsController);

export default router;
