require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Product = require("../src/models/Product");

const categoryMap = {
  Flowers: "flowers",
  "Hair Accessories": "hair-accessories",
  "Soft Toys": "soft-toys",
  Keychains: "keychains",
  "Valentine Gifts": "valentine-gifts",
  Rakhi: "rakhi",
};

const migrateCategories = async () => {
  try {
    await connectDB();

    let updatedCount = 0;

    for (const [oldCategory, newCategory] of Object.entries(categoryMap)) {
      const result = await Product.updateMany(
        { category: oldCategory },
        { $set: { category: newCategory } }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `${oldCategory} → ${newCategory}: ${result.modifiedCount} product(s)`
        );

        updatedCount += result.modifiedCount;
      }
    }

    console.log(`\nMigration completed. Updated: ${updatedCount} product(s).`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Category migration failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateCategories();