import { Router } from "express";
import { chatWithAiController, getAiConversationDetailController, getLatestAiConversationController } from "#controllers/ai.controller";
import { Validate } from "#middlewares/Validate";
import { OptionalAuth } from "#middlewares/OptionalAuth";
import { aiChatSchema } from "#validations/ai.validation";

const router = Router();

router.get("/conversations/latest", OptionalAuth, getLatestAiConversationController);
router.get("/conversations/:conversationId", OptionalAuth, getAiConversationDetailController);
router.post("/chat", OptionalAuth, Validate(aiChatSchema), chatWithAiController);

export default router;
