import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import {
  authenticate,
  authorize,
} from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { uploadSingle } from "../../../../middlewares/upload.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/schemas/category.schema.js";

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.use(authenticate);
router.post(
  "/",
  authorize(["superAdmin"]),
  uploadSingle("image"),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  "/:id",
  authorize(["superAdmin"]),
  uploadSingle("image"),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authorize(["superAdmin"]),
  categoryController.deleteCategory
);

export default router;
