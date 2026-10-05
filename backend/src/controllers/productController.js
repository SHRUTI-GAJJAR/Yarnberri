const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { isValidObjectId } = require("../utils/validation");

const VALID_CATEGORIES = [
  "hair-accessories",
  "soft-toys",
  "keychains",
  "flowers",
  "valentine-gifts",
  "rakhi",
];

const normalizeCategory = (category) => {
  if (!category) {
    return null;
  }

  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return VALID_CATEGORIES.includes(normalized)
    ? normalized
    : null;
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      readyToShip,
      preparationTime,
    } = req.body;

    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category",
        allowedCategories: VALID_CATEGORIES,
      });
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "yarnberri/products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: normalizedCategory,
      images: uploadedImages,
      stock,
      readyToShip: readyToShip === "true",
      preparationTime:
        readyToShip === "true" ? "" : preparationTime,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
      error,
    });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "readyToShip",
      "preparationTime",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "category") {
          const normalizedCategory = normalizeCategory(
            req.body.category
          );

          if (!normalizedCategory) {
            return res.status(400).json({
              success: false,
              message: "Invalid product category",
              allowedCategories: VALID_CATEGORIES,
            });
          }

          product.category = normalizedCategory;
        } else if (field === "readyToShip") {
          product.readyToShip =
            req.body.readyToShip === "true";
        } else {
          product[field] = req.body[field];
        }
      }
    }

    // Upload new images only if the admin selected new files.
    if (req.files && req.files.length > 0) {
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "yarnberri/products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
      }

      // Replace old image URLs with new images.
      product.images = uploadedImages;
    }

    // Hide preparation time when the product is ready to ship.
    if (product.readyToShip === true) {
      product.preparationTime = "";
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};