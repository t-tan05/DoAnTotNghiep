import { createAttributeValueController, updateAttributeValueController } from "#controllers/attributeValue.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Validate } from "#middlewares/Validate";
import { createAttributeValueSchema } from "#validations/attributeValue.validation";
import { Router } from "express";

const router = Router();

router.post("/", VerifyToken, CheckRole("ADMIN"), Validate(createAttributeValueSchema), createAttributeValueController);
router.patch("/:attributeValueId", VerifyToken, CheckRole("ADMIN"), updateAttributeValueController);

export default router;