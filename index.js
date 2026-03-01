const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items").router;
const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = (process.env.MONGODB_URI || "").replace(/^["']|["']$/g, "").trim();

// Global middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Optional: simple request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection with retry
async function connectDB() {
  if (!MONGODB_URI || MONGODB_URI.trim() === "") {
    console.error("❌ MONGODB_URI is missing. Add it to your .env file.");
    process.exit(1);
  }

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI.trim(), {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log("✅ Connected to MongoDB Atlas");
      return;
    } catch (err) {
      lastError = err;
      console.error(`❌ MongoDB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        console.log("   Retrying in 2 seconds...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  console.error("\n--- Troubleshooting ---");
  if (lastError?.message?.includes("authentication failed")) {
    console.error("• Wrong username or password. In Atlas: Database Access → Edit user → Update password");
    console.error("• If password has #, @, or *, URL-encode: # → %23, @ → %40, * → %2A");
  }
  if (lastError?.message?.includes("ENOTFOUND") || lastError?.message?.includes("getaddrinfo")) {
    console.error("• Atlas Network Access: Add your IP (or 0.0.0.0/0 for testing)");
    console.error("• Check cluster host in Atlas connection string");
  }
  process.exit(1);
}


// Health check
app.get("/", (req, res) => {
  res.json({ message: "Digital Lost & Found API is running (DB connected)" });
});

// Main API route mounts
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server only after MongoDB connects
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });