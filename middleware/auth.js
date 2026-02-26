/**
 * JWT authentication & authorization middleware.
 *
 * CURRENT MODE: verifies JWT only, does NOT hit the database.
 * req.user will contain the decoded token payload.
 *
 * LATER (with MongoDB Atlas):
 *  - After verifying the token, you can look up the user in MongoDB
 *    using the userId from the payload to ensure the user still exists.
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-prod";

// Authenticate any logged-in user
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, role, ... }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Authorize only admins (role-based access control)
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
};

