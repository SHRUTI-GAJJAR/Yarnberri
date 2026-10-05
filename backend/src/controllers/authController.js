const crypto = require("crypto");
const User = require("../models/User");
const createAdminAccount = require("../utils/createAdminAccount");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res, next) => {
  try {
    const { name, email,password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((validationError) =>
            validationError.path === "password"
              ? "Password must be at least 8 characters."
              : validationError.message
          )
          .join(", "),
      });
    }

    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
  } catch (error) {
    next(error);
  }
};

const setupAdminAccount = async (req, res) => {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret || !setupSecret.trim()) {
    return res.status(503).json({
      success: false,
      message: "Admin setup is not configured on the server.",
    });
  }

  const { name, email, password, setupKey } = req.body || {};
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof setupKey !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    !setupKey ||
    setupKey.length > 512
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, and admin setup key are required.",
    });
  }

  const submittedSecret = Buffer.from(setupKey, "utf8");
  const expectedSecret = Buffer.from(setupSecret, "utf8");
  if (
    submittedSecret.length !== expectedSecret.length ||
    !crypto.timingSafeEqual(submittedSecret, expectedSecret)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin setup key.",
    });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedName.length < 2 || normalizedName.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 50 characters.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  try {
    const user = await createAdminAccount({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === "ADMIN_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000 && error.keyPattern?.role) {
      return res.status(409).json({
        success: false,
        message: "An admin account already exists.",
      });
    }
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Admin account setup failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create the admin account right now.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  setupAdminAccount,
};