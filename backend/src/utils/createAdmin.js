require("dotenv").config();

const connectDB = require("../config/db");
const createAdminAccount = require("./createAdminAccount");

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin email or password is missing in .env");
    }

    await createAdminAccount({
      name: "Yarnberri Admin",
      email: adminEmail.toLowerCase(),
      password: adminPassword,
    });

    console.log("Admin account created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();