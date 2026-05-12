const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const OTPStore = require("../models/OTPStore");
const { issueJWT } = require("../middleware/auth");

// Validate phone (10+ digits) or email
const isValidPhone = (v) => /^\+?[0-9]{10,15}$/.test(v);
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, identifier, identifierType, role, password, cropType, harvestDate, storageMethod, latitude, longitude, region } = req.body;

  // Validate name
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name_required" });
  }

  // Validate identifier
  if (identifierType === "phone" && !isValidPhone(identifier)) {
    return res.status(400).json({ error: "invalid_phone" });
  }
  if (identifierType === "email" && !isValidEmail(identifier)) {
    return res.status(400).json({ error: "invalid_email" });
  }

  // Check duplicate
  const existing = await User.findOne({ identifier });
  if (existing) {
    return res.status(409).json({ error: "identifier_taken" });
  }

  try {
    let passwordHash;
    if (["policymaker", "trader"].includes(role)) {
      if (!password) return res.status(400).json({ error: "password_required" });
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = new User({
      name: name.trim(),
      identifier,
      identifierType,
      role,
      passwordHash,
      cropType,
      harvestDate,
      storageMethod,
      latitude,
      longitude,
      region: region || ""
    });
    await user.save();

    const token = issueJWT(user);
    res.json({ token, user: { _id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "registration_failed" });
  }
});

// POST /auth/otp/request
router.post("/otp/request", async (req, res) => {
  const { phone } = req.body;
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: "invalid_phone" });
  }

  const user = await User.findOne({ identifier: phone, identifierType: "phone" });
  if (!user) {
    return res.status(404).json({ error: "user_not_found" });
  }

  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPStore.create({ phone, otpHash, expiresAt, used: false });

    // Send SMS via Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: `Your Post-Harvest Intelligence OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_FROM,
        to: phone
      });
    } else {
      // Dev mode: log OTP to console
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    res.json({ message: "otp_sent" });
  } catch (err) {
    console.error("OTP request error:", err.message);
    res.status(500).json({ error: "otp_send_failed" });
  }
});

// POST /auth/otp/verify
router.post("/otp/verify", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "phone_and_otp_required" });
  }

  const record = await OTPStore.findOne({ phone, used: false }).sort({ expiresAt: -1 });
  if (!record) {
    return res.status(400).json({ error: "otp_not_found" });
  }

  if (new Date() > record.expiresAt) {
    await OTPStore.updateOne({ _id: record._id }, { used: true });
    return res.status(400).json({ error: "otp_expired" });
  }

  const valid = await bcrypt.compare(otp.toString(), record.otpHash);
  if (!valid) {
    return res.status(400).json({ error: "otp_invalid" });
  }

  await OTPStore.updateOne({ _id: record._id }, { used: true });

  const user = await User.findOne({ identifier: phone, identifierType: "phone" });
  if (!user) return res.status(404).json({ error: "user_not_found" });

  const token = issueJWT(user);
  res.json({ token, user: { _id: user._id, name: user.name, role: user.role } });
});

// POST /auth/login — email+password for policymaker/trader
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "credentials_required" });
  }

  const user = await User.findOne({ identifier });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = issueJWT(user);
  res.json({ token, user: { _id: user._id, name: user.name, role: user.role } });
});

module.exports = router;
