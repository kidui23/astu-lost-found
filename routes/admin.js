const express = require("express");
const Item = require("../models/Item");
const User = require("../models/User");
const Claim = require("../models/Claim");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * Basic admin stats endpoint (mock)
 *
 * CURRENT MODE: returns hard-coded placeholder numbers.
 * LATER (with MongoDB Atlas):
 *  - Replace this logic with real aggregation on Item and User collections,
 *    e.g. using Item.countDocuments({ status: "lost" }) etc.
 */
// Basic admin stats endpoint
router.get("/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const [usersCount, itemsCount, lostCount, foundCount, claimedCount] =
      await Promise.all([
        User.countDocuments(),
        Item.countDocuments(),
        Item.countDocuments({ status: "lost" }),
        Item.countDocuments({ status: "found" }),
        Item.countDocuments({ status: "claimed" }),
      ]);

    return res.json({
      usersCount,
      itemsCount,
      byStatus: {
        lost: lostCount,
        found: foundCount,
        claimed: claimedCount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
});

// Get all pending claims (admin only)
router.get("/claims", authenticate, requireAdmin, async (req, res) => {
  try {
    const pendingClaims = await Claim.find({ status: "pending" });

    // Map `_id` to `id` for frontend compatibility
    const formattedClaims = pendingClaims.map((c) => ({
      ...c.toObject(),
      id: c._id.toString(),
      itemId: c.itemId.toString(),
      claimantId: c.claimantId.toString()
    }));

    return res.json(formattedClaims);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load claims" });
  }
});

// Approve a claim
router.post("/claims/:claimId/approve", authenticate, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "pending") return res.status(400).json({ message: "Claim is not pending" });

    // Update claim status
    claim.status = "approved";
    await claim.save();

    // Update the associated item
    await Item.findByIdAndUpdate(claim.itemId, { status: "claimed" });

    return res.json({ message: "Claim approved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to approve claim" });
  }
});

// Reject a claim
router.post("/claims/:claimId/reject", authenticate, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "pending") return res.status(400).json({ message: "Claim is not pending" });

    // Update claim status
    claim.status = "rejected";
    await claim.save();

    return res.json({ message: "Claim rejected successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to reject claim" });
  }
});

module.exports = router;
