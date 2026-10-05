const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;