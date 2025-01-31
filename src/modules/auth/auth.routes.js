import express from "express";
import passport from "passport";
import User from "../user/user.model.js"; // Correct path
import bcrypt from "bcryptjs"; // For password hashing

const router = express.Router();

// Root route
router.get("/", (req, res) => {
  res.render("home"); // Render the home.ejs template
});

// Route for user registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Log the user in (you can use Passport or sessions here)
    req.login(user, (err) => {
      if (err) throw err;
      res.status(200).json({ message: "Logged in successfully", user });
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// Google OAuth2 routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;