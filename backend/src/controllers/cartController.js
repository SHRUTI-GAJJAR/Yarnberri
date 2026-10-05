const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { isValidObjectId } = require("../utils/validation");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and positive integer quantity are required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity,
          },
        ],
      });
    } else {
      // Check if product is already in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        // Increase quantity
        if (product.stock < existingItem.quantity + quantity) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity is not available in stock",
          });
        }

        existingItem.quantity += quantity;
      } else {
        // Add new product
        cart.items.push({
          product: productId,
          quantity,
        });
      }

      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to cart",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price images stock");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty",
        totalItems: 0,
        cartTotal: 0,
        items: [],
      });
    }

    const items = cart.items.map((item) => {
      const subtotal = item.product.price * item.quantity;

      return {
        product: item.product,
        quantity: item.quantity,
        subtotal,
      };
    });

    const totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const cartTotal = items.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    return res.status(200).json({
      success: true,
      totalItems,
      cartTotal,
      items,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get cart",
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the product in the cart
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    // Check current stock
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product no longer exists",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart quantity",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove product from cart",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};