const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      default: "lost",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: String,
    dateLost: Date,
    dateFound: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);

