const crypto = require("crypto");
const Razorpay = require("razorpay");

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createRazorpayOrder = async (order) => {
  const client = getRazorpayClient();

  if (!client) {
    return null;
  }

  return client.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: { yarnberriOrderId: order._id.toString() },
  });
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
};