const mongoose = require("mongoose");

const riskRecordSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subjectType: { type: String, enum: ["farmer", "batch"], required: true },
  cropType: { type: String, required: true },
  storageMethod: { type: String },
  temperature: { type: Number },
  humidity: { type: Number },
  rainfall: { type: Number, default: 0 },
  marketPriceTrend: { type: String, enum: ["rising", "stable", "falling"], default: "stable" },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ["Green", "Yellow", "Red"], required: true },
  explanation: { type: Array, default: [] },
  recommendations: { type: [String], default: [] },
  calculatedAt: { type: Date, default: Date.now }
});

riskRecordSchema.index({ subjectId: 1, calculatedAt: -1 });

module.exports = mongoose.model("RiskRecord", riskRecordSchema);
