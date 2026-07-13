import { attachGuestConversationsToUser } from "#models/ai.model";
import { chatWithAiService, getAiConversationDetailService, getLatestAiConversationService } from "#services/ai.service";
import { CatchAsync } from "#utils/CatchAsync";
const COOKIE_NAME = process.env.AI_GUEST_COOKIE_NAME || "ai_guest_id";
function getOrSetGuestId(req, res) {
    const existedGuesId = req.cookies?.[COOKIE_NAME];
    if (existedGuesId)
        return existedGuesId;
    const guestId = crypto.randomUUID();
    res.cookie(COOKIE_NAME, guestId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 180, //180 ngày
    });
    return guestId;
}
;
async function mergeGuestChatIfLoggedIn(req, res, userId) {
    const guestId = req.cookies?.[COOKIE_NAME];
    if (!userId || !guestId)
        return;
    await attachGuestConversationsToUser(guestId, userId);
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
}
export const chatWithAiController = CatchAsync(async (req, res) => {
    const user = req.user;
    const userId = user?.user_id || null;
    await mergeGuestChatIfLoggedIn(req, res, userId);
    const guestId = userId ? null : getOrSetGuestId(req, res);
    const data = await chatWithAiService(req.body, {
        userId,
        guestId,
    });
    res.status(200).json({
        message: "Chat AI thành công.",
        data: {
            ...data,
        },
    });
});
export const getLatestAiConversationController = CatchAsync(async (req, res) => {
    const user = req.user;
    const userId = user?.user_id || null;
    await mergeGuestChatIfLoggedIn(req, res, userId);
    const guestId = userId ? null : req.cookies?.[COOKIE_NAME] || null;
    if (!userId && !guestId) {
        return res.status(200).json({
            message: "Lấy lịch sử chat AI thành công.",
            data: {
                conversation: null,
                messages: [],
            },
        });
    }
    const data = await getLatestAiConversationService({
        userId,
        guestId,
    });
    res.status(200).json({
        message: "Lấy lịch sử chat AI thành công.",
        data: {
            ...data
        },
    });
});
export const getAiConversationDetailController = CatchAsync(async (req, res) => {
    const user = req.user;
    const userId = user?.user_id || null;
    await mergeGuestChatIfLoggedIn(req, res, userId);
    const guestId = userId ? null : req.cookies?.[COOKIE_NAME] || null;
    const conversationId = String(req.params.conversationId || "");
    const data = await getAiConversationDetailService(conversationId, {
        userId,
        guestId,
    });
    res.status(200).json({
        message: "Lấy chi tiết lịch sử chat AI thành công.",
        data: {
            ...data
        },
    });
});
