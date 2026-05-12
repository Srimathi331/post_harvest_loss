const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");

// Derive an Indian state/region name from lat/lng using bounding boxes
function deriveRegion(lat, lng) {
  const regions = [
    { name: "Punjab",         latMin: 29.5, latMax: 32.5, lngMin: 73.8, lngMax: 76.9 },
    { name: "Haryana",        latMin: 27.6, latMax: 30.9, lngMin: 74.4, lngMax: 77.6 },
    { name: "Uttar Pradesh",  latMin: 23.8, latMax: 30.4, lngMin: 77.0, lngMax: 84.7 },
    { name: "Rajasthan",      latMin: 23.0, latMax: 30.2, lngMin: 69.4, lngMax: 78.3 },
    { name: "Gujarat",        latMin: 20.1, latMax: 24.7, lngMin: 68.1, lngMax: 74.5 },
    { name: "Maharashtra",    latMin: 15.6, latMax: 22.0, lngMin: 72.6, lngMax: 80.9 },
    { name: "Madhya Pradesh", latMin: 21.1, latMax: 26.9, lngMin: 74.0, lngMax: 82.8 },
    { name: "Karnataka",      latMin: 11.5, latMax: 18.5, lngMin: 74.0, lngMax: 78.6 },
    { name: "Tamil Nadu",     latMin:  8.0, latMax: 13.6, lngMin: 76.2, lngMax: 80.4 },
    { name: "Andhra Pradesh", latMin: 12.6, latMax: 19.9, lngMin: 76.7, lngMax: 84.8 },
    { name: "Telangana",      latMin: 15.8, latMax: 19.9, lngMin: 77.2, lngMax: 81.3 },
    { name: "Kerala",         latMin:  8.2, latMax: 12.8, lngMin: 74.8, lngMax: 77.4 },
    { name: "West Bengal",    latMin: 21.5, latMax: 27.2, lngMin: 85.8, lngMax: 89.9 },
    { name: "Bihar",          latMin: 24.3, latMax: 27.5, lngMin: 83.3, lngMax: 88.3 },
    { name: "Odisha",         latMin: 17.8, latMax: 22.6, lngMin: 81.3, lngMax: 87.5 },
    { name: "Assam",          latMin: 24.1, latMax: 28.2, lngMin: 89.7, lngMax: 96.0 },
  ];

  for (const r of regions) {
    if (lat >= r.latMin && lat <= r.latMax && lng >= r.lngMin && lng <= r.lngMax) {
      return r.name;
    }
  }
  return "Other";
}

// Route 1: Register a new farmer
router.post("/", async (req, res) => {
  const { name, cropType, latitude, longitude, mobileNumber } = req.body;

  if (!name || !cropType || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!mobileNumber) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  try {
    // Check if farmer with this mobile number already exists
    const existingFarmer = await Farmer.findOne({ mobileNumber });
    
    if (existingFarmer) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    // Create new farmer
    const farmer = new Farmer({ 
      name, 
      cropType, 
      latitude, 
      longitude,
      mobileNumber,
      region: deriveRegion(latitude, longitude)
    });
    await farmer.save();
    
    res.json({
      ...farmer.toObject(),
      message: "Registration successful! You can now login with your mobile number."
    });
  } catch (err) {
    console.error("Error saving farmer:", err.message);
    // Handle MongoDB duplicate key error (race condition between check and insert)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }
    res.status(500).json({ error: "Failed to save farmer" });
  }
});

// Route 2: Get all farmers
router.get("/", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    console.error("Error fetching farmers:", err.message);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Route 3: Get a single farmer by ID
router.get("/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json(farmer);
  } catch (err) {
    console.error("Error fetching farmer:", err.message);
    res.status(500).json({ error: "Failed to fetch farmer" });
  }
});

// Route 4: Login with mobile number
router.get("/mobile/:mobileNumber", async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ mobileNumber: req.params.mobileNumber });
    if (!farmer) return res.status(404).json({ error: "Mobile number not registered" });
    res.json(farmer);
  } catch (err) {
    console.error("Error fetching farmer by mobile:", err.message);
    res.status(500).json({ error: "Failed to fetch farmer" });
  }
});

// Route 5: Login with farmer code
router.get("/code/:farmerCode", async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ farmerCode: req.params.farmerCode });
    if (!farmer) return res.status(404).json({ error: "Farmer code not found" });
    res.json(farmer);
  } catch (err) {
    console.error("Error fetching farmer by code:", err.message);
    res.status(500).json({ error: "Failed to fetch farmer" });
  }
});

module.exports = router;
