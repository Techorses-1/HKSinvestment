
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://admin:Admin%402025@187.77.66.6:27017/hksinvestment?authSource=admin&authMechanism=SCRAM-SHA-256",
      {

      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
