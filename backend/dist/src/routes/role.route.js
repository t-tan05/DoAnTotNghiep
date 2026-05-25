import { createRoleController, deleteRoleController, getAllRolesController } from "#controllers/role.controller";
import { VerifyToken } from "#middlewares/Auth";
import { CheckRole } from "#middlewares/CheckRole";
import { Router } from "express";
const router = Router();
router.post("/", VerifyToken, CheckRole("ADMIN"), createRoleController);
router.delete("/:roleName", VerifyToken, CheckRole("ADMIN"), deleteRoleController);
router.get("/", VerifyToken, CheckRole("ADMIN"), getAllRolesController);
export default router;
