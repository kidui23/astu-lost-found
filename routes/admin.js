const express = require("express");
// const Item = require("../models/Item"); // <-- For real MongoDB later
// const User = require("../models/User"); // <-- For real MongoDB later
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

module.exports = router;
