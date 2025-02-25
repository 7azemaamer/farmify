// routes/product.routes.js
import express from "express";
import { getAllProducts, getProductsById, createProduct, updateProduct, deleteProduct, searchProducts } from "../controllers/product.controller.js";
import {isAdmin, isUser ,isSuperAdmin} from'../../../../../src/middlewares/auth.middleware.js';
import { errorHandler } from '../../../../utils/errorHandling.js';
const router = express.Router();
router.get('/', isUser, getAllProducts);
router.get('/:id', isUser, getProductsById);
router.post('/', isAdmin, createProduct);
router.put('/:id', isAdmin, updateProduct);
router.delete('/:id', isSuperAdmin,deleteProduct);
router.get('/search', isUser, searchProducts);

router.use(errorHandler);
export default router;

