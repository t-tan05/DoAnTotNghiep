import { CatchAsync } from "#utils/CatchAsync";
import { handleGhnOrderStatusWebhookService } from "#services/ghnWebhook.service";
export const ghnOrderStatusWebhookController = CatchAsync(async (req, res) => {
    await handleGhnOrderStatusWebhookService(req.body);
    res.status(200).json({
        success: true,
        message: "Webhook received.",
    });
});
