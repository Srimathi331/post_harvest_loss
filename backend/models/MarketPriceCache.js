const mongoose = require("mongoose");

const marketPriceCacheSchema = new mongoose.Schema({
  cropType: { type: String, required: true, unique: true },
  currentPrice: { type: Number, required: true },
  thirtyDayAverage: { type: Number, required: true },
  trend: { type: String, enum: ["rising", "stable", "falling"], default: "stable" },
  fetchedAt: { type: Date, default: Date.now },
  source: { type: String, default: "agmarknet" }
});

module.exports = mongoose.model("MarketPriceCache", marketPriceCacheSchema);
