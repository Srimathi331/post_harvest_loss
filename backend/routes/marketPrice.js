const express = require("express");
const router = express.Router();
const marketPriceService = require("../services/marketPriceService");

// Route 1: Get current market price for a crop
router.get("/:cropType", async (req, res) => {
  try {
    const { cropType } = req.params;
    const { region } = req.query;

    const priceData = await marketPriceService.getMarketPrice(cropType, region);
    res.json(priceData);
  } catch (err) {
    console.error("Error fetching market price:", err.message);
    res.status(500).json({ error: "Failed to fetch market price" });
  }
});

// Route 2: Get price trend for a crop
router.get("/:cropType/trend", async (req, res) => {
  try {
    const { cropType } = req.params;
    const { days = 7 } = req.query;

    const trendData = await marketPriceService.getPriceTrend(cropType, parseInt(days));
    res.json(trendData);
  } catch (err) {
    console.error("Error fetching price trend:", err.message);
    res.status(500).json({ error: "Failed to fetch price trend" });
  }
});

// Route 3: Get multiple crop prices
router.post("/batch", async (req, res) => {
  try {
    const { crops, region } = req.body;

    if (!Array.isArray(crops)) {
      return res.status(400).json({ error: "Crops must be an array" });
    }

    const pricePromises = crops.map(crop => 
      marketPriceService.getMarketPrice(crop, region)
    );

    const prices = await Promise.all(pricePromises);
    const result = crops.map((crop, index) => ({
      crop,
      ...prices[index]
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching batch prices:", err.message);
    res.status(500).json({ error: "Failed to fetch batch prices" });
  }
});

module.exports = router;
