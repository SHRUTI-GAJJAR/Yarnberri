const express = require("express");

const {
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  verifyPayment,
  markPaymentFailed,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.post("/:orderId/verify-payment", protect, verifyPayment);
router.post("/:orderId/payment-failed", protect, markPaymentFailed);

router.put("/:orderId/cancel", protect, cancelOrder);

router.get("/:orderId", protect, getOrderById);

module.exports = router;