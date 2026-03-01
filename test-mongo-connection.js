/**
 * Run this to test your MongoDB connection:  node test-mongo-connection.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const uri = process.env.MONGODB_URI;

console.log("Testing MongoDB connection...");
console.log("URI (password hidden):", uri ? uri.replace(/:[^:@]+@/, ":****@") : "NOT SET");

if (!uri) {
  console.error("\n❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

const mongoose = require("mongoose");

mongoose
  .connect(uri.trim(), {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("\n✅ SUCCESS! MongoDB connected.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Connection failed:");
    console.error("   Message:", err.message);
    console.error("\n   Full error:", err);
    process.exit(1);
  });
