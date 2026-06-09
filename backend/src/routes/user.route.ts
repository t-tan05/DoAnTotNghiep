import { Router } from "express";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { delUserController, getAllUsersController, lockUserController, profileController, unlockUserController, updatePasswordController, updateProfileController } from "#controllers/user.controller";
import { Validate } from "#middlewares/Validate";
import { updatePasswordSchema } from "#validations/user.validation";
import { changePasswordLimiter } from "#config/rateLimit";

const router = Router();

router.get("/", VerifyToken, CheckRole("ADMIN"), getAllUsersController);
router.get("/me", VerifyToken, profileController);
router.patch("/me", VerifyToken, updateProfileController);
router.patch("/:userId/lock", VerifyToken, CheckRole("ADMIN"), lockUserController);
router.patch("/:userId/unlock", VerifyToken, CheckRole("ADMIN"), unlockUserController);
router.delete("/:userId", VerifyToken, CheckRole("ADMIN"), delUserController);
router.patch("/me/password",changePasswordLimiter, VerifyToken, Validate(updatePasswordSchema), updatePasswordController);

export default router;