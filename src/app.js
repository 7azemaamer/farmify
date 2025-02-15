import express from "express";
import { errorHandler } from "./utils/errorHandling.js";
import connectDB from "./config/database.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Db Connection
connectDB();

// Routes

app.use("/api/v1/auth", authRoutes);

//Custom Error Handling
app.use(errorHandler);

export default app;
