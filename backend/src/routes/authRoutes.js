const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  setupAdminAccount,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();
const adminSetupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin setup attempts. Please try again later.",
  },
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-setup", adminSetupLimiter, setupAdminAccount);

router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Yarnberri Admin!",
  });
});

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;