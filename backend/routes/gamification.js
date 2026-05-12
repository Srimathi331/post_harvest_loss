const express = require("express");
const router = express.Router();
const Gamification = require("../models/Gamification");
const CropBatch = require("../models/CropBatch");
const User = require("../models/User");

// Route 1: Get farmer's gamification profile
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    let gamification = await Gamification.findOne({ farmerId }).populate('farmerId', 'name email');
    
    if (!gamification) {
      // Create new gamification profile
      gamification = new Gamification({ farmerId });
      await gamification.save();
      gamification = await Gamification.findOne({ farmerId }).populate('farmerId', 'name email');
    }
    
    // Get leaderboard info
    const allFarmers = await Gamification.find().sort({ lossPreventionScore: -1 });
    const nationalRank = allFarmers.findIndex(f => f.farmerId.toString() === farmerId) + 1;
    
    gamification.leaderboard.nationalRank = nationalRank;
    gamification.leaderboard.totalFarmers = allFarmers.length;
    
    res.json(gamification);
  } catch (err) {
    console.error("Error fetching gamification profile:", err.message);
    res.status(500).json({ error: "Failed to fetch gamification profile" });
  }
});

// Route 2: Add points for farmer actions
router.post("/farmer/:farmerId/add-points", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { points, action, description } = req.body;
    
    if (!points || !action) {
      return res.status(400).json({ error: "Points and action are required" });
    }
    
    let gamification = await Gamification.findOne({ farmerId });
    if (!gamification) {
      gamification = new Gamification({ farmerId });
    }
    
    const newBadges = await gamification.addPoints(points, action);
    
    res.json({
      success: true,
      newScore: gamification.lossPreventionScore,
      newLevel: gamification.level,
      newBadges,
      message: description || `Added ${points} points for ${action}`
    });
  } catch (err) {
    console.error("Error adding points:", err.message);
    res.status(500).json({ error: "Failed to add points" });
  }
});

// Route 3: Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { region, limit = 50 } = req.query;
    
    let query = {};
    if (region) {
      // Filter by region (would need to join with User/Farmer data)
      // For now, return all farmers
    }
    
    const leaderboard = await Gamification.find(query)
      .populate('farmerId', 'name email')
      .sort({ lossPreventionScore: -1 })
      .limit(parseInt(limit));
    
    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        farmer: entry.farmerId,
        score: entry.lossPreventionScore,
        level: entry.level,
        badges: entry.badges.length,
        streak: entry.streak.currentStreak
      })),
      totalFarmers: leaderboard.length
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Route 4: Get regional leaderboard
router.get("/leaderboard/region/:region", async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20 } = req.query;
    
    // Get farmers from this region (would need proper region filtering)
    const regionalFarmers = await User.find({ region: new RegExp(region, 'i') });
    const farmerIds = regionalFarmers.map(f => f._id);
    
    const leaderboard = await Gamification.find({ farmerId: { $in: farmerIds } })
      .populate('farmerId', 'name email region')
      .sort({ lossPreventionScore: -1 })
      .limit(parseInt(limit));
    
    res.json({
      region,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        farmer: entry.farmerId,
        score: entry.lossPreventionScore,
        level: entry.level,
        badges: entry.badges.length,
        streak: entry.streak.currentStreak
      })),
      totalFarmers: leaderboard.length
    });
  } catch (err) {
    console.error("Error fetching regional leaderboard:", err.message);
    res.status(500).json({ error: "Failed to fetch regional leaderboard" });
  }
});

// Route 5: Award badge manually (for admin use)
router.post("/farmer/:farmerId/award-badge", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { type, name, description, icon } = req.body;
    
    if (!type || !name || !description) {
      return res.status(400).json({ error: "Badge type, name, and description are required" });
    }
    
    let gamification = await Gamification.findOne({ farmerId });
    if (!gamification) {
      gamification = new Gamification({ farmerId });
    }
    
    // Check if badge already exists
    if (gamification.hasBadge(type)) {
      return res.status(400).json({ error: "Farmer already has this badge" });
    }
    
    const newBadge = {
      type,
      name,
      description,
      icon: icon || "https://img.icons8.com/color/48/trophy.png",
      earnedAt: new Date()
    };
    
    gamification.badges.push(newBadge);
    await gamification.save();
    
    res.json({
      success: true,
      badge: newBadge,
      totalBadges: gamification.badges.length
    });
  } catch (err) {
    console.error("Error awarding badge:", err.message);
    res.status(500).json({ error: "Failed to award badge" });
  }
});

// Route 6: Get achievements summary
router.get("/farmer/:farmerId/achievements", async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const gamification = await Gamification.findOne({ farmerId });
    if (!gamification) {
      return res.json({
        achievements: {
          totalBatchesManaged: 0,
          riskMitigated: 0,
          recommendationsFollowed: 0,
          perfectStorageDays: 0,
          earlyInterventions: 0
        },
        badges: [],
        streak: { currentStreak: 0, longestStreak: 0 }
      });
    }
    
    res.json({
      achievements: gamification.achievements,
      badges: gamification.badges,
      streak: gamification.streak,
      score: gamification.lossPreventionScore,
      level: gamification.level,
      nextLevel: gamification.getNextLevelInfo()
    });
  } catch (err) {
    console.error("Error fetching achievements:", err.message);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// Route 7: Track recommendation follow
router.post("/farmer/:farmerId/recommendation-followed", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { recommendationType, impact } = req.body;
    
    let gamification = await Gamification.findOne({ farmerId });
    if (!gamification) {
      gamification = new Gamification({ farmerId });
    }
    
    // Add points based on impact
    let points = 10; // Base points for following recommendation
    if (impact === 'high') points = 25;
    else if (impact === 'medium') points = 15;
    
    const newBadges = await gamification.addPoints(points, 'recommendation_followed');
    
    res.json({
      success: true,
      pointsAwarded: points,
      newScore: gamification.lossPreventionScore,
      newBadges,
      message: `Great job! You earned ${points} points for following the ${recommendationType} recommendation.`
    });
  } catch (err) {
    console.error("Error tracking recommendation:", err.message);
    res.status(500).json({ error: "Failed to track recommendation" });
  }
});

// Route 8: Track risk mitigation
router.post("/farmer/:farmerId/risk-mitigated", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { riskLevel, action, preventedLoss } = req.body;
    
    let gamification = await Gamification.findOne({ farmerId });
    if (!gamification) {
      gamification = new Gamification({ farmerId });
    }
    
    // Calculate points based on risk level and prevented loss
    let points = 20; // Base points
    if (riskLevel === 'Red') points = 50;
    else if (riskLevel === 'Yellow') points = 30;
    
    // Bonus points for prevented loss
    if (preventedLoss && preventedLoss > 0) {
      points += Math.min(preventedLoss * 0.1, 50); // Max 50 bonus points
    }
    
    const newBadges = await gamification.addPoints(points, 'risk_mitigated');
    
    res.json({
      success: true,
      pointsAwarded: Math.round(points),
      newScore: gamification.lossPreventionScore,
      newBadges,
      message: `Excellent! You prevented a ${riskLevel} risk and earned ${Math.round(points)} points.`
    });
  } catch (err) {
    console.error("Error tracking risk mitigation:", err.message);
    res.status(500).json({ error: "Failed to track risk mitigation" });
  }
});

module.exports = router;
