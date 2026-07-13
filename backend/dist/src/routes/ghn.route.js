import { Router } from "express";
import { getGhnDistrictsController, getGhnProvincesController, getGhnWardsController, } from "#controllers/ghn.controller";
import { VerifyToken } from "#middlewares/Auth";
const router = Router();
router.get("/provinces", VerifyToken, getGhnProvincesController);
router.get("/districts", VerifyToken, getGhnDistrictsController);
router.get("/wards", VerifyToken, getGhnWardsController);
export default router;
