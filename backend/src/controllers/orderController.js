const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  createRazorpayOrder,
  verifyPaymentSignature,
} = require("../services/paymentService");
const { isValidObjectId } = require("../utils/validation");

const createOrder = async (req, res) => {
  try {
    const { addressId, checkoutType, productId, quantity } = req.body;

    // Validate address
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Please select a delivery address",
      });
    }

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    // Validate checkout type
    if (!["cart", "buy_now"].includes(checkoutType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkout type",
      });
    }

    // Get selected address
    const user = await User.findById(req.user._id);
    const selectedAddress = user.addresses.id(addressId);

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    // 🛒 CART CHECKOUT
    if (checkoutType === "cart") {
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Your cart is empty",
        });
      }

      for (const item of cart.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "One of the products in your cart no longer exists",
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${product.name} does not have enough stock`,
          });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images?.[0] || "",
          preparationTime: product.preparationTime || "",
        });

        totalAmount += product.price * item.quantity;
      }
    }

    // ⚡ BUY NOW / DIRECT CHECKOUT
    if (checkoutType === "buy_now") {
      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Product ID and quantity are required",
        });
      }

      if (!isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (quantity < 1 || quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity is not available in stock",
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || "",
        preparationTime: product.preparationTime || "",
      });

      totalAmount = product.price * quantity;
    }

    // Generate order number
    const orderNumber = `YB-${Date.now()}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: selectedAddress.country,
      },
      totalAmount,
      checkoutType,
      paymentStatus: "pending",
      orderStatus: "pending_payment",
    });

    let razorpayOrder = null;

try {
  razorpayOrder = await createRazorpayOrder(order);

  if (!razorpayOrder) {
    await Order.findByIdAndDelete(order._id);

    return res.status(503).json({
      success: false,
      message: "Online payment is currently unavailable. Please try again later.",
    });
  }

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();
} catch (paymentError) {
  await Order.findByIdAndDelete(order._id);

  console.error("Create Razorpay order error:", paymentError);

  return res.status(502).json({
    success: false,
    message: "Unable to initialize payment. Please try again later.",
  });
}

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      payment: razorpayOrder
        ? {
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : null,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    // Make sure the order belongs to this user
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = [
      "pending_payment",
      "paid",
      "confirmed",
    ];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    // Cancel the order
    order.orderStatus = "cancelled";
    order.cancellationReason = cancellationReason || "";
    order.cancelledAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get order",
    });
  }
};

const verifyPayment = async (req, res) => {
  const { orderId } = req.params;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!isValidObjectId(orderId)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: "Razorpay payment details are required",
    });
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id }).select(
    "+razorpaySignature"
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Payment was already verified",
      order,
    });
  }

  if (order.orderStatus === "cancelled") {
    return res.status(400).json({
      success: false,
      message: "Cancelled orders cannot be paid",
    });
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({
      success: false,
      message: "Razorpay order does not match this order",
    });
  }

  if (
    !verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    })
  ) {
    order.paymentStatus = "failed";
    await order.save();
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const paymentOrder = await Order.findOne({
      _id: order._id,
      paymentStatus: "pending",
      orderStatus: { $ne: "cancelled" },
    }).session(session);

    if (!paymentOrder) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Order payment is no longer pending",
      });
    }

    for (const item of paymentOrder.items) {
      const stockUpdate = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (stockUpdate.modifiedCount !== 1) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    paymentOrder.paymentStatus = "paid";
    paymentOrder.orderStatus = "confirmed";
    paymentOrder.razorpayPaymentId = razorpayPaymentId;
    paymentOrder.razorpaySignature = razorpaySignature;
    paymentOrder.paidAt = new Date();
    await paymentOrder.save({ session });

    if (paymentOrder.checkoutType === "cart") {
      await Cart.updateOne(
        { user: req.user._id },
        { $set: { items: [] } },
        { session }
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      order: paymentOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Verify payment error:", error);
    await Order.findByIdAndUpdate(order._id, { paymentStatus: "failed" });
    return res.status(400).json({
      success: false,
      message: error.message || "Payment could not be completed",
    });
  } finally {
    await session.endSession();
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        user: req.user._id,
        paymentStatus: "pending",
        orderStatus: "pending_payment",
      },
      { $set: { paymentStatus: "failed" } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pending order not found or payment is already finalized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      order,
    });
  } catch (error) {
    console.error("Mark payment failed error:", error);
    return res.status(500).json({ success: false, message: "Failed to update payment status" });
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  verifyPayment,
  markPaymentFailed,
};