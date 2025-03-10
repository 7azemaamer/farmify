import express from "express";
import * as warehouseController from "../controllers/warehouse.controller.js";
import {
  authenticate,
  authorize,
} from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadSingle } from "../../../middlewares/upload.middleware.js";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "../validations/warehouse.schema.js";

const router = express.Router();

// Public routes
router.get("/", warehouseController.getAllWarehouses);
router.get("/:id", warehouseController.getWarehouseById);

// Protected routes for admins
router.use(authenticate);
router.post(
  "/",
  authorize(["superAdmin"]),
  uploadSingle("image"),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse
);

router.patch(
  "/:id",
  authorize(["superAdmin", "warehouseAdmin"]),
  uploadSingle("image"),
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse
);

export default router;
