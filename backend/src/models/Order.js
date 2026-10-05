const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    preparationTime: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    checkoutType: {
      type: String,
      enum: ["cart", "buy_now"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
      select: false,
    },

    paidAt: {
      type: Date,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "confirmed",
        "processing",
        "ready_to_ship",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending_payment",
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    cancelledAt: {
      type: Date,
    },

    shippingDetails: {
      courierName: {
        type: String,
        default: "",
      },

      trackingId: {
        type: String,
        default: "",
      },

      trackingUrl: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;