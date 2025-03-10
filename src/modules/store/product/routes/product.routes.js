import express from "express";
import * as productController from "../controllers/product.controller.js";
import {
  authenticate,
  authorize,
} from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { uploadMultiple } from "../../../../middlewares/upload.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/schemas/product.schema.js";

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductsByCategory);

// Protected routes
router.use(authenticate);

// User routes
router.post("/:id/rating", productController.addProductRating);

// Admin routes
router.post(
  "/",
  authorize(["superAdmin", "warehouseAdmin"]),
  uploadMultiple("images", 5),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  authorize(["superAdmin", "warehouseAdmin"]),
  uploadMultiple("images", 5),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  authorize(["superAdmin", "warehouseAdmin"]),
  productController.deleteProduct
);

export default router;
