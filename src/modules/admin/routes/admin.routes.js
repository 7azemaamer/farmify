import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import {
  authenticate,
  authorize,
} from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { updateUserRoleSchema } from "../validations/schemas/user.schema.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(authenticate);

// Dashboard
router.get(
  "/dashboard",
  authorize(["superAdmin", "warehouseAdmin"]),
  adminController.getDashboardStats
);

// User Management Routes (Only for superAdmin)
router.get("/users", authorize(["superAdmin"]), adminController.getAllUsers);

router.get(
  "/users/:id",
  authorize(["superAdmin"]),
  adminController.getUserById
);

router.patch(
  "/users/:id/role",
  authorize(["superAdmin"]),
  validate(updateUserRoleSchema),
  adminController.updateUserRole
);

export default router;
