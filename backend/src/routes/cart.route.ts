import {
    addCartItemController,
    clearMyCartController,
    deleteCartItemController,
    getMyCartController,
    updateCartItemController,
} from "#controllers/cart.controller";
import { VerifyToken } from "#middlewares/Auth";
import { Validate } from "#middlewares/Validate";
import { addCartItemSchema, updateCartItemSchema } from "#validations/cart.validation";
import { Router } from "express";

const router = Router();

router.use(VerifyToken);

router.get("/me",VerifyToken, getMyCartController);
router.post("/items",VerifyToken, Validate(addCartItemSchema), addCartItemController);
router.patch("/items/:cartItemId",VerifyToken, Validate(updateCartItemSchema), updateCartItemController);
router.delete("/items/:cartItemId",VerifyToken, deleteCartItemController);
router.delete("/me",VerifyToken, clearMyCartController);

export default router;