import { getDashboardSummaryController, trackPageViewController, } from "#controllers/dashboard.controller";
import { CheckRole } from "#middlewares/CheckRole";
import { VerifyToken } from "#middlewares/Auth";
import { Router } from "express";
const router = Router();
router.post("/track", trackPageViewController);
router.use(VerifyToken);
router.get("/admin/summary", CheckRole("ADMIN"), getDashboardSummaryController);
export default router;
