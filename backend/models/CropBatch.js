const mongoose = require("mongoose");

const cropBatchSchema = new mongoose.Schema({
  traderId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
  cropType: { type: String, required: true },
  quantity: { type: Number, required: true }, // kg
  harvestDate: { type: Date, required: true },
  storageMethod: {
    type: String,
    enum: ["open_air", "dry_warehouse", "cold_storage", "refrigerated_transport"],
    required: true
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  region: { type: String, default: "" },
  currentRiskScore: { type: Number, default: null },
  currentRiskLevel: { type: String, enum: ["Green", "Yellow", "Red"], default: null },
  lastUpdated: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("CropBatch", cropBatchSchema);
