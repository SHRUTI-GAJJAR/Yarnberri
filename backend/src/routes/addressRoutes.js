const express = require("express");

const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/", protect, getAddresses);
router.put("/:addressId", protect, updateAddress);
router.delete("/:addressId", protect, deleteAddress);

module.exports = router;