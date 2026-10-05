const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateShipping,
} = require("../controllers/adminOrderController");

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getAllOrders);
router.get("/:orderId", getAdminOrderById);
router.put("/:orderId/status", updateOrderStatus);
router.put("/:orderId/shipping", updateShipping);

module.exports = router;