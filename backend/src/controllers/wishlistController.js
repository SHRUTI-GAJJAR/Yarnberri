const Product = require("../models/Product");
const User = require("../models/User");
const { isValidObjectId } = require("../utils/validation");

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate("wishlist", "name description price category images stock readyToShip preparationTime");

    return res.status(200).json({
      success: true,
      products: (user?.wishlist || []).filter(Boolean),
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your wishlist right now.",
    });
  }
};

const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  try {
    const product = await Product.findById(productId).select(
      "name description price category images stock readyToShip preparationTime"
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { wishlist: product._id } }
    );

    return res.status(200).json({
      success: true,
      message: "Product saved to your wishlist.",
      product,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save this product right now.",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  try {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { wishlist: productId } }
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from your wishlist.",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to remove this product right now.",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
