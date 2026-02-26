/**
 * Main entry point for the Digital Lost & Found API.
 *
 * CURRENT MODE: mock in-memory data (no live MongoDB needed).
 * This lets you run and test the API structure immediately.
 *
 * LATER: when you are ready to use MongoDB Atlas,
 *  1. Create a cluster on Atlas
 *  2. Get your connection string and put it in .env as MONGODB_URI
 *  3. Uncomment the mongoose connection section below
 *  4. Replace all "mock" arrays in routes with real Mongoose queries
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose"); // <-- Uncomment when using real MongoDB

// Routes
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;
// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_lost_found";

// Global middlewares
app.use(cors());
app.use(express.json());

// Optional: simple request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/**
 * MongoDB Atlas connection (DISABLED in mock mode)
 *
 * When you are ready to connect to Atlas:
 *  - Make sure you have MONGODB_URI in your .env
 *  - Uncomment the block below
 *  - Remove/replace mock implementations in routes with real queries
 */
// mongoose
//   .connect(MONGODB_URI, {
//     serverSelectionTimeoutMS: 5000,
//   })
//   .then(() => console.log("✅ Connected to MongoDB Atlas"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Digital Lost & Found API is running (mock mode)" });
});

// Main API route mounts
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});