const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      addresses: req.user.addresses,
    },
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    }

    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Current password and a new password of at least 8 characters are required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

module.exports = { getProfile, updateProfile, changePassword };