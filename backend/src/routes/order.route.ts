import {
    cancelMyOrderController,
    checkoutOrderController,
    getMyOrderDetailController,
    getMyOrdersController,
    cancelOrderForStaffController,
    confirmOrderController,
    getAllOrdersController,
    getOrderDetailForStaffController,
    vnpayReturnController,
    vnpayIpnController,
    buyNowOrderController
} from "#controllers/order.controller";
import { VerifyToken } from "#middlewares/Auth";
import { Validate } from "#middlewares/Validate";
import { buyNowOrderSchema, checkoutOrderSchema } from "#validations/order.validation";
import { Router } from "express";
import { CheckRole } from "#middlewares/CheckRole";

const router = Router();

router.get("/payment/vnpay-ipn", vnpayIpnController);
router.get("/payment/vnpay-return", vnpayReturnController);

router.use(VerifyToken);

router.post("/checkout", CheckRole("CUSTOMER"), Validate(checkoutOrderSchema), checkoutOrderController);
router.post("/buy-now", CheckRole("CUSTOMER"), Validate(buyNowOrderSchema), buyNowOrderController);
router.get("/me", CheckRole("CUSTOMER"), getMyOrdersController);
router.get("/me/:orderId", CheckRole("CUSTOMER"), getMyOrderDetailController);
router.patch("/me/:orderId/cancel", CheckRole("CUSTOMER"), cancelMyOrderController);

router.get("/", CheckRole("ADMIN", "EMPLOYEE"), getAllOrdersController);
router.get("/:orderId", CheckRole("ADMIN", "EMPLOYEE"), getOrderDetailForStaffController);
router.patch("/:orderId/confirm", CheckRole("ADMIN", "EMPLOYEE"), confirmOrderController);
router.patch("/:orderId/cancel", CheckRole("ADMIN", "EMPLOYEE"), cancelOrderForStaffController);

export default router;
