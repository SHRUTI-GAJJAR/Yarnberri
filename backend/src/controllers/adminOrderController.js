const Order = require("../models/Order");
const { isValidObjectId } = require("../utils/validation");

const allowedStatuses = [
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "cancelled",
];

const statusTransitions = {
  pending_payment: ["confirmed", "paid", "cancelled"],
  paid: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const getAllOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.query;
    const filters = {};

    if (orderStatus) {
      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({ success: false, message: "Invalid order status" });
      }
      filters.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      if (!["pending", "paid", "failed"].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: "Invalid payment status" });
      }
      filters.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to get orders" });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.orderId).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get admin order error:", error);
    return res.status(500).json({ success: false, message: "Failed to get order" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (orderStatus === "paid" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "An order cannot be marked paid before payment verification",
      });
    }
    if (order.orderStatus === orderStatus) {
      return res.status(200).json({ success: true, message: "Order status is unchanged", order });
    }
    if (!statusTransitions[order.orderStatus].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "cancelled") {
      order.cancelledAt = new Date();
      order.cancellationReason = req.body.cancellationReason || "Cancelled by admin";
    }
    await order.save();

    return res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update admin order status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

const updateShipping = async (req, res) => {
  try {
    const { courierName, trackingId, trackingUrl } = req.body;
    if (!isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    if (trackingUrl !== undefined && trackingUrl !== "") {
      try {
        const parsedUrl = new URL(trackingUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
      } catch {
        return res.status(400).json({ success: false, message: "Invalid tracking URL" });
      }
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (courierName !== undefined) order.shippingDetails.courierName = String(courierName).trim();
    if (trackingId !== undefined) order.shippingDetails.trackingId = String(trackingId).trim();
    if (trackingUrl !== undefined) order.shippingDetails.trackingUrl = trackingUrl.trim();
    await order.save();

    return res.status(200).json({ success: true, message: "Shipping information updated", order });
  } catch (error) {
    console.error("Update shipping error:", error);
    return res.status(500).json({ success: false, message: "Failed to update shipping information" });
  }
};

module.exports = {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateShipping,
};