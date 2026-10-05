const express = require("express");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/quantity", protect, updateCartQuantity);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;