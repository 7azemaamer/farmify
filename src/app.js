import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./utils/errorHandling.js";
import connectDB from "./config/database.js";
import { handleMulterError } from "./middlewares/upload.middleware.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import userRoutes from "./modules/user/routes/user.routes.js";
import productRoutes from "./modules/store/product/routes/product.routes.js";
import categoryRoutes from "./modules/store/category/routes/category.routes.js";
import orderRoutes from "./modules/store/order/routes/order.routes.js";
import cartRoutes from "./modules/store/cart/routes/cart.routes.js";
import equipmentRoutes from "./modules/equipment/routes/equipment.routes.js";
import warehouseRoutes from "./modules/warehouse/routes/warehouse.routes.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Body:", req.body);
  console.log("Request Headers:", req.headers);
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(
      `[${new Date().toISOString()}] Response Status: ${res.statusCode}`
    );
    console.log("Response Body:", body);
    return originalSend.call(this, body);
  };
  next();
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });
  next(err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Initialize database connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    next(error);
  }
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/equipments", equipmentRoutes);
app.use("/api/v1/warehouses", warehouseRoutes);

// Multer error handling
app.use(handleMulterError);

// Custom Error Handling
app.use(errorHandler);

export default app;
