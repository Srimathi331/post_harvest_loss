const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  identifier: { type: String, required: true, unique: true, trim: true },
  identifierType: { type: String, enum: ["phone", "email"], required: true },
  role: { type: String, enum: ["farmer", "trader", "policymaker", "researcher"], required: true },
  passwordHash: { type: String }, // policymaker/trader only
  cropType: { type: String },     // farmer only
  harvestDate: { type: Date },    // farmer only
  storageMethod: {
    type: String,
    enum: ["open_air", "dry_warehouse", "cold_storage", "refrigerated_transport"]
  },
  latitude: { type: Number },
  longitude: { type: Number },
  region: { type: String, default: "" },
  languagePreference: { type: String, enum: ["en", "hi", "ta"], default: "en" },
  lossPreventionScore: { type: Number, default: 0 }, // farmer only
  badges: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for leaderboard queries
userSchema.index({ role: 1, region: 1, lossPreventionScore: -1 });

module.exports = mongoose.model("User", userSchema);
