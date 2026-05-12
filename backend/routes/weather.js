const express = require("express");
const router = express.Router();
const axios = require("axios");
const Farmer = require("../models/Farmer");
const calculateRisk = require("../utils/riskCalculator");

// Simple in-memory cache: key = "lat,lon" → { data, fetchedAt }
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function fetchWeatherAndRisk(latitude, longitude, cropType) {
  const cacheKey = `${parseFloat(latitude).toFixed(2)},${parseFloat(longitude).toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);

  let weatherData;
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    weatherData = cached.data;
  } else {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    weatherData = response.data;
    weatherCache.set(cacheKey, { data: weatherData, fetchedAt: Date.now() });
  }

  const rainfall = weatherData.rain
    ? weatherData.rain["1h"] || weatherData.rain["3h"] || 0
    : 0;
  const windSpeed = weatherData.wind ? weatherData.wind.speed : 0;

  const risk = calculateRisk(
    weatherData.main.temp,
    weatherData.main.humidity,
    cropType,
    rainfall,
    windSpeed
  );

  return { weather: weatherData, risk };
}

// Route 1: Direct lat/lon + crop query
router.get("/coords/:lat/:lon", async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const cropType = req.query.crop || "default";
    const { weather, risk } = await fetchWeatherAndRisk(lat, lon, cropType);
    res.json({ weather, risk });
  } catch (err) {
    console.error("Error fetching weather or risk:", err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Route 2: Farmer profile lookup
router.get("/farmer/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    const { latitude, longitude, cropType } = farmer;
    const { weather, risk } = await fetchWeatherAndRisk(latitude, longitude, cropType);
    res.json({ weather, risk, farmer });
  } catch (err) {
    console.error("Error fetching farmer weather:", err.message);
    res.status(500).json({ error: "Failed to fetch farmer data" });
  }
});

// Route 3: Get all farmers with risk (for policymaker dashboard)
// Uses cache to avoid hitting OpenWeatherMap rate limits
router.get("/farmers/risk", async (req, res) => {
  try {
    const farmers = await Farmer.find();

    if (farmers.length === 0) {
      return res.json([]);
    }

    const results = await Promise.all(
      farmers.map(async (farmer) => {
        try {
          const { latitude, longitude, cropType } = farmer;
          const { weather, risk } = await fetchWeatherAndRisk(latitude, longitude, cropType);
          return {
            farmer: farmer.toObject(),
            weather: {
              temp: weather.main.temp,
              humidity: weather.main.humidity,
              description: weather.weather?.[0]?.description || "",
              city: weather.name || "",
            },
            risk,
          };
        } catch (innerErr) {
          console.error(`Weather fetch failed for farmer ${farmer._id}:`, innerErr.message);
          // Return farmer with a fallback risk instead of dropping them
          return {
            farmer: farmer.toObject(),
            weather: null,
            risk: "Unknown",
            error: "Weather data unavailable",
          };
        }
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Error fetching farmers with risk:", err.message);
    res.status(500).json({ error: "Failed to fetch farmers with risk" });
  }
});

module.exports = router;
