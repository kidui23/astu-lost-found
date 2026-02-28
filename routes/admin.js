const express = require("express");
// const Item = require("../models/Item"); // <-- For real MongoDB later
// const User = require("../models/User"); // <-- For real MongoDB later
const { authenticate, requireAdmin } = require("../middleware/auth");
const { mockItems, mockClaims } = require("./items");

const router = express.Router();

/**
 * Basic admin stats endpoint (mock)
 *
 * CURRENT MODE: returns hard-coded placeholder numbers.
 * LATER (with MongoDB Atlas):
 *  - Replace this logic with real aggregation on Item and User collections,
 *    e.g. using Item.countDocuments({ status: "lost" }) etc.
 */
router.get("/stats", authenticate, requireAdmin, (req, res) => {
  try {
    // MOCK VALUES:
    const usersCount = 10;
    const itemsCount = 25;
    const lostCount = 15;
    const foundCount = 7;
    const claimedCount = 3;

    // REAL DB LATER:
    // const [usersCount, itemsCount, lostCount, foundCount, claimedCount] =
    //   await Promise.all([
    //     User.countDocuments(),
    //     Item.countDocuments(),
    //     Item.countDocuments({ status: "lost" }),
    //     Item.countDocuments({ status: "found" }),
    //     Item.countDocuments({ status: "claimed" }),
    //   ]);

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
router.get("/claims", authenticate, requireAdmin, (req, res) => {
  try {
    const pendingClaims = mockClaims.filter((c) => c.status === "pending");
    return res.json(pendingClaims);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load claims" });
  }
});

// Approve a claim
router.post("/claims/:claimId/approve", authenticate, requireAdmin, (req, res) => {
  try {
    const claim = mockClaims.find((c) => c.id === req.params.claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "pending") return res.status(400).json({ message: "Claim is not pending" });

    // Update claim status
    claim.status = "approved";

    // Update the associated item
    const item = mockItems.find((i) => i.id === claim.itemId);
    if (item) {
      item.status = "claimed";
    }

    return res.json({ message: "Claim approved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to approve claim" });
  }
});

// Reject a claim
router.post("/claims/:claimId/reject", authenticate, requireAdmin, (req, res) => {
  try {
    const claim = mockClaims.find((c) => c.id === req.params.claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "pending") return res.status(400).json({ message: "Claim is not pending" });

    // Update claim status
    claim.status = "rejected";

    return res.json({ message: "Claim rejected successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to reject claim" });
  }
});

module.exports = router;
