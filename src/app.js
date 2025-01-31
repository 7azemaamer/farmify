import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./utils/errorHandling.js"
import authRoutes from "./modules/auth/auth.routes.js"
import session from "express-session";
import passport from "passport";
import profileRoutes from "./modules/routes/profileRoutes.js"
import "./config/passport-setup.js";

dotenv.config();

const app = express()

// Set up EJS for templating
app.set("view engine", "ejs");

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Db Connection
connectDB()

// Session configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Routes
  app.use("/auth", authRoutes)
  app.use("/", profileRoutes);


// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ status: "error", message: "Something went wrong!" });
  });

  export default app;
