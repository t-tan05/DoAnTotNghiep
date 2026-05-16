import { Router } from "express";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { getAllUsersController, lockUserController, profileController, unlockUserController, updateProfileController } from "#controllers/user.controller";

const router = Router();

router.get("/", VerifyToken, CheckRole("ADMIN"), getAllUsersController);
router.get("/me", VerifyToken, profileController);
router.patch("/me", VerifyToken, updateProfileController);
router.patch("/:userId/lock", VerifyToken, CheckRole("ADMIN"), lockUserController);
router.patch("/:userId/unlock", VerifyToken, CheckRole("ADMIN"), unlockUserController);

export default router;