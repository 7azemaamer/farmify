import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { createOrderSchema } from "../validations/schemas/order.schema.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;
