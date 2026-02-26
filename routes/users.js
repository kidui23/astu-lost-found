const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/User"); // <-- For real MongoDB later

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-prod";

/**
 * MOCK USERS ARRAY (no database required)
 * --------------------------------------
 * This keeps users in memory so the API works without MongoDB.
 * When you connect MongoDB Atlas:
 *  - Replace all operations on mockUsers with real User model queries.
 */
const mockUsers = [];
let nextUserId = 1;

// Seed a default admin for testing login/admin routes
(async () => {
  const email = "admin@example.com";
  const exists = mockUsers.find((u) => u.email === email);
  if (!exists) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    mockUsers.push({
      id: String(nextUserId++),
      name: "Admin User",
      email,
      passwordHash,
      role: "admin",
    });
    console.log('Seeded mock admin user: admin@example.com / admin123');
  }
})();

// Register a new user (mock)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    // MOCK: check in-memory array
    const existing = mockUsers.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: String(nextUserId++),
      name,
      email,
      passwordHash,
      role: "user",
    };

    mockUsers.push(user);

    // REAL DB LATER:
    // const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to register user" });
  }
});

// Login user (mock)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // MOCK: query the in-memory array
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to login" });
  }
});

module.exports = router;
