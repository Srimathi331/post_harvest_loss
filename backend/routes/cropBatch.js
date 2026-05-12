const express = require("express");
const router = express.Router();
const CropBatch = require("../models/CropBatch");
const RiskRecord = require("../models/RiskRecord");
const Gamification = require("../models/Gamification");
const axios = require("axios");
const marketPriceService = require("../services/marketPriceService");

// Helper: award gamification points silently (non-blocking)
async function awardPoints(farmerId, points, action) {
  try {
    let gamification = await Gamification.findOne({ farmerId });
    if (!gamification) gamification = new Gamification({ farmerId });
    await gamification.addPoints(points, action);
  } catch (err) {
    console.warn("Gamification update failed (non-critical):", err.message);
  }
}

// Route 1: Create a new crop batch
router.post("/", async (req, res) => {
  const { 
    traderId, 
    cropType, 
    quantity, 
    harvestDate, 
    storageMethod, 
    latitude, 
    longitude, 
    region 
  } = req.body;

  if (!traderId || !cropType || !quantity || !harvestDate || !storageMethod || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const cropBatch = new CropBatch({
      traderId,
      cropType,
      quantity,
      harvestDate,
      storageMethod,
      latitude,
      longitude,
      region: region || ""
    });

    await cropBatch.save();
    // Award points for managing a new batch
    awardPoints(traderId, 15, 'batch_managed');
    res.json(cropBatch);
  } catch (err) {
    console.error("Error saving crop batch:", err.message);
    res.status(500).json({ error: "Failed to save crop batch" });
  }
});

// Route 2: Get all crop batches
router.get("/", async (req, res) => {
  try {
    const cropBatches = await CropBatch.find().populate('traderId', 'name email');
    res.json(cropBatches);
  } catch (err) {
    console.error("Error fetching crop batches:", err.message);
    res.status(500).json({ error: "Failed to fetch crop batches" });
  }
});

// Route 3: Get crop batches by trader ID
router.get("/trader/:traderId", async (req, res) => {
  try {
    const cropBatches = await CropBatch.find({ traderId: req.params.traderId }).sort({ createdAt: -1 });
    res.json(cropBatches);
  } catch (err) {
    console.error("Error fetching trader crop batches:", err.message);
    res.status(500).json({ error: "Failed to fetch trader crop batches" });
  }
});

// Route 4: Get crop batches by region
router.get("/region/:region", async (req, res) => {
  try {
    const cropBatches = await CropBatch.find({ region: req.params.region }).populate('traderId', 'name email');
    res.json(cropBatches);
  } catch (err) {
    console.error("Error fetching regional crop batches:", err.message);
    res.status(500).json({ error: "Failed to fetch regional crop batches" });
  }
});

// Route 5: Update risk assessment for a crop batch
router.put("/:id/risk", async (req, res) => {
  try {
    const { riskScore, riskLevel } = req.body;
    
    const updatedBatch = await CropBatch.findByIdAndUpdate(
      req.params.id,
      { 
        currentRiskScore: riskScore,
        currentRiskLevel: riskLevel,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ error: "Crop batch not found" });
    }

    res.json(updatedBatch);
  } catch (err) {
    console.error("Error updating risk assessment:", err.message);
    res.status(500).json({ error: "Failed to update risk assessment" });
  }
});

// Route 6: Get risk assessment for a specific crop batch using AI service
router.get("/:id/risk-assessment", async (req, res) => {
  try {
    const cropBatch = await CropBatch.findById(req.params.id);
    if (!cropBatch) {
      return res.status(404).json({ error: "Crop batch not found" });
    }

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${cropBatch.latitude}&lon=${cropBatch.longitude}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const weatherData = {
      temperature: weatherResponse.data.main.temp,
      humidity: weatherResponse.data.main.humidity,
      rainfall: weatherResponse.data.rain ? (weatherResponse.data.rain["1h"] || weatherResponse.data.rain["3h"] || 0) : 0
    };

    // Get market price data
    const marketData = await marketPriceService.getMarketPrice(cropBatch.cropType, cropBatch.region);

    let riskAssessment;

    try {
      // Call AI service for risk assessment
      const aiResponse = await axios.post("https://post-harvest-loss-ai.onrender.com/predict", {
        crop_type: cropBatch.cropType,
        harvest_date: cropBatch.harvestDate.toISOString().split('T')[0],
        storage_method: cropBatch.storageMethod,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
        market_price_trend: marketData.trend
      });
      riskAssessment = aiResponse.data;
    } catch (aiErr) {
      console.warn("AI service unavailable, using fallback risk calculation:", aiErr.message);
      // Fallback: simple rule-based risk when AI service is down
      const daysSinceHarvest = Math.floor(
        (Date.now() - new Date(cropBatch.harvestDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      let riskScore = 20;
      if (weatherData.humidity > 80) riskScore += 25;
      else if (weatherData.humidity > 65) riskScore += 10;
      if (weatherData.temperature > 35) riskScore += 20;
      else if (weatherData.temperature > 28) riskScore += 10;
      if (daysSinceHarvest > 14) riskScore += 20;
      else if (daysSinceHarvest > 7) riskScore += 10;
      if (weatherData.rainfall > 20) riskScore += 15;
      const storageBonus = { open_air: 0, dry_warehouse: -10, cold_storage: -20, refrigerated_transport: -25 };
      riskScore = Math.max(0, Math.min(100, riskScore + (storageBonus[cropBatch.storageMethod] || 0)));
      const riskLevel = riskScore >= 70 ? "Red" : riskScore >= 40 ? "Yellow" : "Green";
      riskAssessment = {
        riskScore,
        riskLevel,
        recommendations: [
          riskLevel === "Red"
            ? "High risk detected — take immediate action to protect your crop."
            : riskLevel === "Yellow"
            ? "Moderate risk — monitor conditions closely and consider preventive measures."
            : "Conditions look stable — maintain current storage practices.",
          "AI service is temporarily unavailable. This is a simplified assessment."
        ],
        explanation: [
          { factor: "Humidity", value: `${weatherData.humidity}%`, contribution: weatherData.humidity > 80 ? 25 : weatherData.humidity > 65 ? 10 : 0, exceeded: weatherData.humidity > 65 },
          { factor: "Temperature", value: `${weatherData.temperature}°C`, contribution: weatherData.temperature > 35 ? 20 : weatherData.temperature > 28 ? 10 : 0, exceeded: weatherData.temperature > 28 },
          { factor: "Days Since Harvest", value: `${daysSinceHarvest} days`, contribution: daysSinceHarvest > 14 ? 20 : daysSinceHarvest > 7 ? 10 : 0, exceeded: daysSinceHarvest > 7 }
        ]
      };
    }

    // Update the crop batch with new risk assessment
    const previousRiskLevel = cropBatch.currentRiskLevel;
    await CropBatch.findByIdAndUpdate(
      req.params.id,
      {
        currentRiskScore: riskAssessment.riskScore,
        currentRiskLevel: riskAssessment.riskLevel,
        lastUpdated: new Date()
      }
    );

    // Persist risk record for history tracking
    await RiskRecord.create({
      subjectId: cropBatch._id,
      subjectType: "batch",
      cropType: cropBatch.cropType,
      storageMethod: cropBatch.storageMethod,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.rainfall,
      marketPriceTrend: marketData.trend,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      explanation: riskAssessment.explanation,
      recommendations: riskAssessment.recommendations
    });

    // Detect risk level change and award gamification points
    const riskChanged = previousRiskLevel && previousRiskLevel !== riskAssessment.riskLevel;
    const riskImproved = riskChanged &&
      (previousRiskLevel === "Red" && riskAssessment.riskLevel !== "Red") ||
      (previousRiskLevel === "Yellow" && riskAssessment.riskLevel === "Green");

    if (riskImproved) {
      awardPoints(cropBatch.traderId, 30, 'risk_mitigated');
    }

    // Award points for early intervention (Green storage with good practices)
    if (riskAssessment.riskLevel === "Green" && cropBatch.storageMethod !== "open_air") {
      awardPoints(cropBatch.traderId, 5, 'early_intervention');
    }

    res.json({
      cropBatch,
      weather: weatherData,
      market: marketData,
      riskAssessment,
      riskChanged: riskChanged || false,
      previousRiskLevel: previousRiskLevel || null
    });

  } catch (err) {
    console.error("Error performing risk assessment:", err.message);
    res.status(500).json({ error: "Failed to perform risk assessment" });
  }
});

// Route 7: Get risk history for a specific crop batch
router.get("/:id/history", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const records = await RiskRecord.find({ subjectId: req.params.id, subjectType: "batch" })
      .sort({ calculatedAt: -1 })
      .limit(parseInt(limit));
    res.json(records);
  } catch (err) {
    console.error("Error fetching risk history:", err.message);
    res.status(500).json({ error: "Failed to fetch risk history" });
  }
});

// Route 8: Delete a crop batch
router.delete("/:id", async (req, res) => {
  try {
    const deletedBatch = await CropBatch.findByIdAndDelete(req.params.id);
    if (!deletedBatch) {
      return res.status(404).json({ error: "Crop batch not found" });
    }
    res.json({ message: "Crop batch deleted successfully" });
  } catch (err) {
    console.error("Error deleting crop batch:", err.message);
    res.status(500).json({ error: "Failed to delete crop batch" });
  }
});

module.exports = router;
