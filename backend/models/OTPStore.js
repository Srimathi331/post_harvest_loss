const mongoose = require("mongoose");

const otpStoreSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

// TTL index — MongoDB auto-deletes expired OTP records
otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTPStore", otpStoreSchema);
