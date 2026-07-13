import { CatchAsync } from "#utils/CatchAsync";
import { Request, Response } from "express";
import { handleGhnOrderStatusWebhookService } from "#services/ghnWebhook.service";

export const ghnOrderStatusWebhookController = CatchAsync(async(req: Request, res: Response) => {
    await handleGhnOrderStatusWebhookService(req.body);

    res.status(200).json({
        success: true,
        message: "Webhook received.",
    });
});
