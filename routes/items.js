const express = require("express");
const multer = require("multer");
// const Item = require("../models/Item"); // <-- For real MongoDB later
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * MOCK ITEMS ARRAY (no database required)
 * --------------------------------------
 * In-memory store so the API works without MongoDB.
 * When you connect MongoDB Atlas:
 *  - Replace all operations on mockItems with real Item model queries.
 */
const mockItems = [];
let nextItemId = 1;

/**
 * MOCK CLAIMS ARRAY (no database required)
 */
const mockClaims = [];
let nextClaimId = 1;

/**
 * Multer setup (image upload placeholder)
 *
 * CURRENT MODE: stores uploaded files in a local "uploads/" folder.
 * LATER: you can swap this to use a cloud storage service (S3, Cloudinary, etc.)
 *       and store only the URL in MongoDB.
 */
const upload = multer({
  dest: "uploads/", // simple local storage for now
});

// Get all items (public)
router.get("/", (req, res) => {
  const { search, category, status, location } = req.query;

  let filteredItems = mockItems;

  if (search) {
    const s = search.toLowerCase();
    filteredItems = filteredItems.filter(
      (i) =>
        i.title.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s)
    );
  }
  if (category) {
    filteredItems = filteredItems.filter(
      (i) => i.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (status) {
    filteredItems = filteredItems.filter((i) => i.status === status);
  }
  if (location) {
    filteredItems = filteredItems.filter((i) =>
      i.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // REAL DB LATER:
  // const query = {}; // build query object from req.query
  // const items = await Item.find(query).sort({ createdAt: -1 });
  return res.json(filteredItems);
});

// Create a new lost/found item (protected)
router.post(
  "/",
  authenticate,
  upload.single("image"), // optional image upload field name: "image"
  (req, res) => {
    try {
      const {
        title,
        description,
        category,
        status = "lost",
        location,
        dateLost,
        dateFound,
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: "title is required" });
      }

      const newItem = {
        id: String(nextItemId++),
        title,
        description: description || "",
        category: category || "",
        status,
        owner: req.user ? req.user.userId : null, // from JWT
        location: location || "",
        dateLost: dateLost || null,
        dateFound: dateFound || null,
        imagePath: req.file ? req.file.path : null, // path to uploaded image (placeholder)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockItems.push(newItem);

      // REAL DB LATER:
      // const newItem = await Item.create({ ...req.body, owner: req.user.userId, imageUrl });

      return res.status(201).json(newItem);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Failed to create item" });
    }
  }
);

// Get a single item by id (public)
router.get("/:id", (req, res) => {
  try {
    const item = mockItems.find((i) => i.id === req.params.id);

    // REAL DB LATER:
    // const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid item id" });
  }
});

// Update item status (lost/found/claimed) (protected)
router.patch("/:id/status", authenticate, (req, res) => {
  try {
    const { status } = req.body;
    if (!["lost", "found", "claimed"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be lost, found, or claimed" });
    }

    const item = mockItems.find((i) => i.id === req.params.id);

    // REAL DB LATER:
    // const item = await Item.findByIdAndUpdate(
    //   req.params.id,
    //   { status },
    //   { new: true }
    // );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.status = status;
    item.updatedAt = new Date().toISOString();

    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Failed to update status" });
  }
});

// Submit a claim for an item (protected)
router.post("/:id/claim", authenticate, (req, res) => {
  try {
    const item = mockItems.find((i) => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status === "claimed") {
      return res.status(400).json({ message: "Item is already claimed" });
    }

    if (item.owner === req.user.userId) {
      return res.status(400).json({ message: "You cannot claim your own item" });
    }

    const newClaim = {
      id: String(nextClaimId++),
      itemId: item.id,
      itemTitle: item.title,
      claimantId: req.user.userId,
      status: "pending", // pending, approved, rejected
      createdAt: new Date().toISOString(),
    };

    mockClaims.push(newClaim);
    return res.status(201).json({ message: "Claim submitted successfully", claim: newClaim });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to submit claim" });
  }
});

// Export both the router and the mock data arrays so admin route can use them
module.exports = {
  router,
  mockItems,
  mockClaims
};
