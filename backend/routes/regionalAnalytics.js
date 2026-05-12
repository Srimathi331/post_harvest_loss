const express = require("express");
const router = express.Router();
const CropBatch = require("../models/CropBatch");
const Farmer = require("../models/Farmer");
const axios = require("axios");

// Route 1: Get regional risk summary
router.get("/risk-summary", async (req, res) => {
  try {
    const { region } = req.query;
    
    let matchCondition = {};
    if (region) {
      matchCondition.region = new RegExp(region, 'i');
    }

    const cropBatches = await CropBatch.find(matchCondition)
      .populate('traderId', 'name email')
      .lean();

    // Group by region and calculate risk metrics
    const regionData = {};
    cropBatches.forEach(batch => {
      const batchRegion = batch.region || 'Unknown';
      if (!regionData[batchRegion]) {
        regionData[batchRegion] = {
          region: batchRegion,
          totalBatches: 0,
          totalQuantity: 0,
          riskLevels: { Green: 0, Yellow: 0, Red: 0 },
          cropTypes: {},
          storageMethods: {},
          avgRiskScore: 0,
          highRiskBatches: []
        };
      }

      const data = regionData[batchRegion];
      data.totalBatches++;
      data.totalQuantity += batch.quantity;
      
      if (batch.currentRiskLevel) {
        data.riskLevels[batch.currentRiskLevel]++;
      }
      
      if (batch.currentRiskScore !== null) {
        data.avgRiskScore += batch.currentRiskScore;
      }
      
      // Track crop types
      if (!data.cropTypes[batch.cropType]) {
        data.cropTypes[batch.cropType] = 0;
      }
      data.cropTypes[batch.cropType] += batch.quantity;
      
      // Track storage methods
      if (!data.storageMethods[batch.storageMethod]) {
        data.storageMethods[batch.storageMethod] = 0;
      }
      data.storageMethods[batch.storageMethod] += 1;
      
      // Track high-risk batches
      if (batch.currentRiskLevel === 'Red' || batch.currentRiskScore > 70) {
        data.highRiskBatches.push({
          id: batch._id,
          cropType: batch.cropType,
          quantity: batch.quantity,
          riskScore: batch.currentRiskScore,
          storageMethod: batch.storageMethod,
          harvestDate: batch.harvestDate
        });
      }
    });

    // Calculate averages and percentages
    Object.keys(regionData).forEach(region => {
      const data = regionData[region];
      if (data.totalBatches > 0) {
        data.avgRiskScore = Math.round(data.avgRiskScore / data.totalBatches);
        
        // Calculate percentages
        data.riskPercentages = {
          Green: Math.round((data.riskLevels.Green / data.totalBatches) * 100),
          Yellow: Math.round((data.riskLevels.Yellow / data.totalBatches) * 100),
          Red: Math.round((data.riskLevels.Red / data.totalBatches) * 100)
        };
      }
    });

    // Convert to array and sort by risk
    const summary = Object.values(regionData).sort((a, b) => b.avgRiskScore - a.avgRiskScore);

    res.json({
      summary,
      totalRegions: summary.length,
      overallStats: {
        totalBatches: cropBatches.length,
        totalQuantity: summary.reduce((sum, region) => sum + region.totalQuantity, 0),
        avgRiskScore: Math.round(summary.reduce((sum, region) => sum + region.avgRiskScore, 0) / summary.length)
      }
    });

  } catch (err) {
    console.error("Error fetching regional risk summary:", err.message);
    res.status(500).json({ error: "Failed to fetch regional risk summary" });
  }
});

// Route 2: Get crop-specific regional analysis
router.get("/crop-analysis/:cropType", async (req, res) => {
  try {
    const { cropType } = req.params;
    const { region } = req.query;

    let matchCondition = { cropType: new RegExp(cropType, 'i') };
    if (region) {
      matchCondition.region = new RegExp(region, 'i');
    }

    const cropBatches = await CropBatch.find(matchCondition)
      .populate('traderId', 'name email')
      .lean();

    // Group by region for this specific crop
    const regionData = {};
    cropBatches.forEach(batch => {
      const batchRegion = batch.region || 'Unknown';
      if (!regionData[batchRegion]) {
        regionData[batchRegion] = {
          region: batchRegion,
          totalBatches: 0,
          totalQuantity: 0,
          avgRiskScore: 0,
          riskLevels: { Green: 0, Yellow: 0, Red: 0 },
          storageMethods: {},
          avgDaysSinceHarvest: 0,
          priceImpact: 0
        };
      }

      const data = regionData[batchRegion];
      data.totalBatches++;
      data.totalQuantity += batch.quantity;
      
      if (batch.currentRiskScore !== null) {
        data.avgRiskScore += batch.currentRiskScore;
      }
      
      if (batch.currentRiskLevel) {
        data.riskLevels[batch.currentRiskLevel]++;
      }
      
      if (!data.storageMethods[batch.storageMethod]) {
        data.storageMethods[batch.storageMethod] = 0;
      }
      data.storageMethods[batch.storageMethod]++;
      
      // Calculate days since harvest
      const daysSinceHarvest = Math.floor((Date.now() - new Date(batch.harvestDate)) / (1000 * 60 * 60 * 24));
      data.avgDaysSinceHarvest += daysSinceHarvest;
    });

    // Calculate averages
    Object.keys(regionData).forEach(region => {
      const data = regionData[region];
      if (data.totalBatches > 0) {
        data.avgRiskScore = Math.round(data.avgRiskScore / data.totalBatches);
        data.avgDaysSinceHarvest = Math.round(data.avgDaysSinceHarvest / data.totalBatches);
        
        data.riskPercentages = {
          Green: Math.round((data.riskLevels.Green / data.totalBatches) * 100),
          Yellow: Math.round((data.riskLevels.Yellow / data.totalBatches) * 100),
          Red: Math.round((data.riskLevels.Red / data.totalBatches) * 100)
        };
      }
    });

    const analysis = Object.values(regionData).sort((a, b) => b.avgRiskScore - a.avgRiskScore);

    res.json({
      cropType,
      analysis,
      totalRegions: analysis.length,
      overallStats: {
        totalBatches: cropBatches.length,
        totalQuantity: analysis.reduce((sum, region) => sum + region.totalQuantity, 0),
        avgRiskScore: Math.round(analysis.reduce((sum, region) => sum + region.avgRiskScore, 0) / analysis.length)
      }
    });

  } catch (err) {
    console.error("Error fetching crop analysis:", err.message);
    res.status(500).json({ error: "Failed to fetch crop analysis" });
  }
});

// Route 3: Get time-based risk trends
router.get("/risk-trends", async (req, res) => {
  try {
    const { days = 30, region } = req.query;
    const daysBack = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    let matchCondition = {
      harvestDate: { $gte: startDate }
    };
    if (region) {
      matchCondition.region = new RegExp(region, 'i');
    }

    const cropBatches = await CropBatch.find(matchCondition)
      .populate('traderId', 'name email')
      .lean();

    // Group by day
    const dailyData = {};
    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        totalBatches: 0,
        totalQuantity: 0,
        avgRiskScore: 0,
        riskLevels: { Green: 0, Yellow: 0, Red: 0 }
      };
    }

    cropBatches.forEach(batch => {
      const dateKey = batch.harvestDate.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        const data = dailyData[dateKey];
        data.totalBatches++;
        data.totalQuantity += batch.quantity;
        
        if (batch.currentRiskScore !== null) {
          data.avgRiskScore += batch.currentRiskScore;
        }
        
        if (batch.currentRiskLevel) {
          data.riskLevels[batch.currentRiskLevel]++;
        }
      }
    });

    // Calculate averages
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      if (data.totalBatches > 0) {
        data.avgRiskScore = Math.round(data.avgRiskScore / data.totalBatches);
      }
    });

    const trends = Object.values(dailyData).reverse(); // Chronological order

    res.json({
      trends,
      period: `${days} days`,
      overallStats: {
        totalBatches: cropBatches.length,
        totalQuantity: cropBatches.reduce((sum, batch) => sum + batch.quantity, 0),
        avgRiskScore: Math.round(trends.reduce((sum, day) => sum + day.avgRiskScore, 0) / trends.length)
      }
    });

  } catch (err) {
    console.error("Error fetching risk trends:", err.message);
    res.status(500).json({ error: "Failed to fetch risk trends" });
  }
});

// Route 4: Get storage method effectiveness analysis
router.get("/storage-analysis", async (req, res) => {
  try {
    const { region } = req.query;

    let matchCondition = {};
    if (region) {
      matchCondition.region = new RegExp(region, 'i');
    }

    const cropBatches = await CropBatch.find(matchCondition)
      .populate('traderId', 'name email')
      .lean();

    // Group by storage method
    const storageData = {};
    cropBatches.forEach(batch => {
      const method = batch.storageMethod;
      if (!storageData[method]) {
        storageData[method] = {
          storageMethod: method,
          totalBatches: 0,
          totalQuantity: 0,
          avgRiskScore: 0,
          riskLevels: { Green: 0, Yellow: 0, Red: 0 },
          cropTypes: {},
          avgDaysSinceHarvest: 0,
          effectiveness: 0
        };
      }

      const data = storageData[method];
      data.totalBatches++;
      data.totalQuantity += batch.quantity;
      
      if (batch.currentRiskScore !== null) {
        data.avgRiskScore += batch.currentRiskScore;
      }
      
      if (batch.currentRiskLevel) {
        data.riskLevels[batch.currentRiskLevel]++;
      }
      
      if (!data.cropTypes[batch.cropType]) {
        data.cropTypes[batch.cropType] = 0;
      }
      data.cropTypes[batch.cropType] += batch.quantity;
      
      const daysSinceHarvest = Math.floor((Date.now() - new Date(batch.harvestDate)) / (1000 * 60 * 60 * 24));
      data.avgDaysSinceHarvest += daysSinceHarvest;
    });

    // Calculate averages and effectiveness
    Object.keys(storageData).forEach(method => {
      const data = storageData[method];
      if (data.totalBatches > 0) {
        data.avgRiskScore = Math.round(data.avgRiskScore / data.totalBatches);
        data.avgDaysSinceHarvest = Math.round(data.avgDaysSinceHarvest / data.totalBatches);
        
        // Effectiveness score (lower risk = higher effectiveness)
        data.effectiveness = Math.max(0, 100 - data.avgRiskScore);
        
        data.riskPercentages = {
          Green: Math.round((data.riskLevels.Green / data.totalBatches) * 100),
          Yellow: Math.round((data.riskLevels.Yellow / data.totalBatches) * 100),
          Red: Math.round((data.riskLevels.Red / data.totalBatches) * 100)
        };
      }
    });

    const analysis = Object.values(storageData).sort((a, b) => b.effectiveness - a.effectiveness);

    res.json({
      analysis,
      totalMethods: analysis.length,
      overallStats: {
        totalBatches: cropBatches.length,
        totalQuantity: analysis.reduce((sum, method) => sum + method.totalQuantity, 0),
        avgEffectiveness: Math.round(analysis.reduce((sum, method) => sum + method.effectiveness, 0) / analysis.length)
      }
    });

  } catch (err) {
    console.error("Error fetching storage analysis:", err.message);
    res.status(500).json({ error: "Failed to fetch storage analysis" });
  }
});

module.exports = router;
