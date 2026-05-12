const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cropType: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  farmerCode: { type: String, sparse: true, unique: true },
  region: { type: String, default: "" }
});

module.exports = mongoose.model("Farmer", farmerSchema);
