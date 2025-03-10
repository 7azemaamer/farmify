import express from "express";
import * as equipmentController from "../controllers/equipment.controller.js";
import {
  authenticate,
  authorize,
} from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadMultiple } from "../../../middlewares/upload.middleware.js";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from "../validations/equipment.schema.js";

const router = express.Router();

// Public routes
router.get("/", equipmentController.getAllEquipments);
router.get("/search", equipmentController.searchEquipments);
router.get("/category/:category", equipmentController.getEquipmentsByCategory);
router.get("/:id", equipmentController.getEquipmentById);

// Protected routes for admins
router.use(authenticate);
router.post(
  "/",
  authorize(["superAdmin", "warehouseAdmin"]),
  uploadMultiple("images", 5),
  validate(createEquipmentSchema),
  equipmentController.createEquipment
);

router.patch(
  "/:id",
  authorize(["superAdmin", "warehouseAdmin"]),
  uploadMultiple("images", 5),
  validate(updateEquipmentSchema),
  equipmentController.updateEquipment
);

router.delete(
  "/:id",
  authorize(["superAdmin", "warehouseAdmin"]),
  equipmentController.deleteEquipment
);

export default router;
