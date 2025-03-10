import express from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validations/schemas/cart.schema.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getUserCart);
router.post("/", validate(addToCartSchema), cartController.addToCart);
router.patch(
  "/items/:itemId",
  validate(updateCartItemSchema),
  cartController.updateCartItem
);
router.delete("/items/:itemId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export default router;
