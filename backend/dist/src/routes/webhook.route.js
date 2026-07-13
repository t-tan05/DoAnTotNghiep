import { Router } from "express";
import { ghnOrderStatusWebhookController } from "#controllers/ghnWebhook.controller";
const router = Router();
router.post("/ghn/order-status", ghnOrderStatusWebhookController);
export default router;
