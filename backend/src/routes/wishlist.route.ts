import { Router } from "express";
import { VerifyToken } from "#middlewares/Auth";
import {
    addWishlistController,
    checkManyWishlistsController,
    checkWishlistController,
    getMyWishlistsController,
    removeWishlistController,
} from "#controllers/wishlist.controller";

const router = Router();

router.use(VerifyToken);

router.get("/me", getMyWishlistsController);
router.post("/check-many", checkManyWishlistsController);
router.get("/check/:variantId", checkWishlistController);
router.post("/:variantId", addWishlistController);
router.delete("/:variantId", removeWishlistController);

export default router;
