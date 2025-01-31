import express from "express";
const router = express.Router();

router.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/");
  console.log("User object:", req.user); // Add this line to debug
  res.render("profile", { user: req.user });
});

export default router;