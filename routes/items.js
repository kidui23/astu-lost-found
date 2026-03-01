const express = require("express");
const multer = require("multer");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

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
router.get("/", async (req, res) => {
  try {
    const { search, category, status, location } = req.query;
    const query = {};

    if (search) {
      // Create a case-insensitive regex search on title and description
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, "i") }; // case-insensitive match
    }
    if (status) {
      query.status = status;
    }
    if (location) {
      query.location = { $regex: new RegExp(location, "i") };
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    // Map `_id` to `id` for frontend compatibility
    const formattedItems = items.map((i) => {
      const obj = i.toObject();
      return {
        ...obj,
        id: i._id.toString(),
        owner: i.owner ? i.owner.toString() : null,
      };
    });

    return res.json(formattedItems);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch items" });
  }
});

// Create a new lost/found item (protected)
router.post(
  "/",
  authenticate,
  upload.single("image"), // optional image upload field name: "image"
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        status = "lost",
        location,
        locationLat,
        locationLng,
        dateLost,
        dateFound,
        contactPhone,
        contactTelegram,
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: "title is required" });
      }

      const newItemData = {
        title,
        description: description || "",
        category: category || "",
        status,
        owner: req.user ? req.user.userId : null, // from JWT
        location: location || "",
        locationLat: locationLat ? parseFloat(locationLat) : null,
        locationLng: locationLng ? parseFloat(locationLng) : null,
        imagePath: req.file ? req.file.path : null, // path to uploaded image (placeholder)
        contactPhone: contactPhone || "",
        contactTelegram: contactTelegram || "",
      };

      if (dateLost) newItemData.dateLost = dateLost;
      if (dateFound) newItemData.dateFound = dateFound;

      const createdItem = await Item.create(newItemData);

      let smartMatchAlert = null;

      // Smart Matching Concept (SIMPLE DB MATCH - NO AI)
      // If someone posts a "found" item, check if there's a "lost" item in the same category
      if (status === "found" && category) {
        const potentialMatches = await Item.find({
          status: "lost",
          category: new RegExp(`^${category}$`, "i")
        }).limit(3);

        if (potentialMatches.length > 0) {
          smartMatchAlert = `We found ${potentialMatches.length} recent lost items that might match this!`;
        }
      }

      const responseItem = {
        ...createdItem.toObject(),
        id: createdItem._id.toString(),
        smartMatchAlert // Include the alert if one exists
      };

      return res.status(201).json(responseItem);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Failed to create item" });
    }
  }
);

// Get a single item by id (public)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({
      ...item.toObject(),
      id: item._id.toString()
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid item id" });
  }
});

// Update item status (lost/found/claimed) (protected)
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["lost", "found", "claimed"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be lost, found, or claimed" });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({
      ...item.toObject(),
      id: item._id.toString()
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Failed to update status" });
  }
});

// Submit a claim for an item (protected)
router.post("/:id/claim", authenticate, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status === "claimed") {
      return res.status(400).json({ message: "Item is already claimed" });
    }

    if (item.owner && item.owner.toString() === req.user.userId) {
      return res.status(400).json({ message: "You cannot claim your own item" });
    }

    // Ensure user hasn't already submitted a pending claim for this item
    const existingClaim = await Claim.findOne({
      itemId: item._id,
      claimantId: req.user.userId,
      status: "pending"
    });

    if (existingClaim) {
      return res.status(400).json({ message: "You already have a pending claim for this item" });
    }

    const newClaim = await Claim.create({
      itemId: item._id,
      itemTitle: item.title,
      claimantId: req.user.userId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Claim submitted successfully", claim: {
        ...newClaim.toObject(),
        id: newClaim._id.toString()
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to submit claim" });
  }
});

module.exports = {
  router
};
