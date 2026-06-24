import {
    cancelMyOrderController,
    checkoutOrderController,
    getMyOrderDetailController,
    getMyOrdersController,
    cancelOrderForStaffController,
    completeOrderController,
    confirmOrderController,
    getAllOrdersController,
    getOrderDetailForStaffController,
    markDeliveryFailedController,
    shipOrderController,
    vnpayReturnController,
    vnpayIpnController,
    retryPaymentController
} from "#controllers/order.controller";
import { VerifyToken } from "#middlewares/Auth";
import { Validate } from "#middlewares/Validate";
import { checkoutOrderSchema } from "#validations/order.validation";
import { Router } from "express";
import { CheckRole } from "#middlewares/CheckRole";

const router = Router();

router.get("/payment/vnpay-ipn", vnpayIpnController);
router.get("/payment/vnpay-return", vnpayReturnController);

router.use(VerifyToken);

router.post("/checkout", Validate(checkoutOrderSchema), checkoutOrderController);
router.get("/me", getMyOrdersController);
router.get("/me/:orderId", getMyOrderDetailController);
router.patch("/me/:orderId/cancel", cancelMyOrderController);
router.post("/me/:orderId/retry-payment", retryPaymentController);

router.get("/", CheckRole("ADMIN", "EMPLOYEE"), getAllOrdersController);
router.get("/:orderId", CheckRole("ADMIN", "EMPLOYEE"), getOrderDetailForStaffController);
router.patch("/:orderId/confirm", CheckRole("ADMIN", "EMPLOYEE"), confirmOrderController);
router.patch("/:orderId/ship", CheckRole("ADMIN", "EMPLOYEE"), shipOrderController);
router.patch("/:orderId/complete", CheckRole("ADMIN", "EMPLOYEE"), completeOrderController);
router.patch("/:orderId/cancel", CheckRole("ADMIN", "EMPLOYEE"), cancelOrderForStaffController);
router.patch("/:orderId/delivery-failed", CheckRole("ADMIN", "EMPLOYEE"), markDeliveryFailedController);

export default router;