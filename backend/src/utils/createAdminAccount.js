const User = require("../models/User");

const createAdminAccount = async ({ name, email, password }) => {
  await User.init();

  if (await User.exists({ role: "admin" })) {
    const error = new Error("An admin account already exists.");
    error.code = "ADMIN_ALREADY_EXISTS";
    throw error;
  }

  if (await User.exists({ email })) {
    const error = new Error("Email is already registered.");
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  return User.create({
    name,
    email,
    password,
    role: "admin",
  });
};

module.exports = createAdminAccount;
