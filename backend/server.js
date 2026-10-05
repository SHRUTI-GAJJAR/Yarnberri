require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const addressRoutes = require("./src/routes/addressRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const adminOrderRoutes = require("./src/routes/adminOrderRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Yarnberri backend is running successfully!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.green);
});