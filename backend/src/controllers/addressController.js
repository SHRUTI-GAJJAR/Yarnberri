const User = require("../models/User");
const { isValidObjectId } = require("../utils/validation");

const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    // Required fields validation
    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required address fields",
      });
    }

    const user = await User.findById(req.user._id);

    // If this is the user's first address, make it default automatically
    const shouldBeDefault =
      user.addresses.length === 0 || isDefault === true;

    // If the new address is default, remove default from other addresses
    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      pincode,
      country: country || "India",
      isDefault: shouldBeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add address",
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");

    return res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get addresses",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { addressId } = req.params;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const allowedFields = [
      "fullName",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "country",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    // Make this address the default if requested
    if (req.body.isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });

      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update address",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { addressId } = req.params;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    // Remove the address
    user.addresses.pull(addressId);

    // If the deleted address was default,
    // make the first remaining address the default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete address",
    });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};