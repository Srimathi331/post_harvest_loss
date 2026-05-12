const mongoose = require("mongoose");

const gamificationSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  lossPreventionScore: { type: Number, default: 0 },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Beginner" },
  badges: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    icon: { type: String, default: "https://img.icons8.com/color/48/trophy.png" }
  }],
  achievements: {
    totalBatchesManaged: { type: Number, default: 0 },
    riskMitigated: { type: Number, default: 0 },
    recommendationsFollowed: { type: Number, default: 0 },
    perfectStorageDays: { type: Number, default: 0 },
    earlyInterventions: { type: Number, default: 0 }
  },
  streak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now }
  },
  leaderboard: {
    regionalRank: { type: Number, default: null },
    nationalRank: { type: Number, default: null },
    totalFarmers: { type: Number, default: 0 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Calculate level based on score
gamificationSchema.methods.calculateLevel = function() {
  const score = this.lossPreventionScore;
  if (score >= 1000) return "Expert";
  if (score >= 500) return "Advanced";
  if (score >= 200) return "Intermediate";
  return "Beginner";
};

// Add points for various actions
gamificationSchema.methods.addPoints = function(points, action) {
  this.lossPreventionScore += points;
  this.level = this.calculateLevel();
  this.lastUpdated = new Date();
  
  // Update streak
  const today = new Date();
  const lastActivity = new Date(this.streak.lastActivityDate);
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    this.streak.currentStreak += 1;
    this.streak.longestStreak = Math.max(this.streak.longestStreak, this.streak.currentStreak);
  } else if (daysDiff > 1) {
    this.streak.currentStreak = 1;
  }
  
  this.streak.lastActivityDate = today;
  
  // Update achievements based on action
  switch(action) {
    case 'batch_managed':
      this.achievements.totalBatchesManaged += 1;
      break;
    case 'risk_mitigated':
      this.achievements.riskMitigated += 1;
      break;
    case 'recommendation_followed':
      this.achievements.recommendationsFollowed += 1;
      break;
    case 'early_intervention':
      this.achievements.earlyInterventions += 1;
      break;
  }
  
  // Check for new badges
  this.checkBadges();
  
  return this.save();
};

// Check and award badges based on achievements
gamificationSchema.methods.checkBadges = function() {
  const newBadges = [];
  
  // First batch badge
  if (this.achievements.totalBatchesManaged === 1 && !this.hasBadge('first_batch')) {
    newBadges.push({
      type: 'first_batch',
      name: 'First Steps',
      description: 'Managed your first crop batch',
      icon: 'https://img.icons8.com/color/48/seedling.png'
    });
  }
  
  // Risk manager badge
  if (this.achievements.riskMitigated >= 5 && !this.hasBadge('risk_manager')) {
    newBadges.push({
      type: 'risk_manager',
      name: 'Risk Manager',
      description: 'Successfully mitigated 5 risk situations',
      icon: 'https://img.icons8.com/color/48/shield.png'
    });
  }
  
  // Streak badge
  if (this.streak.currentStreak >= 7 && !this.hasBadge('week_streak')) {
    newBadges.push({
      type: 'week_streak',
      name: 'Consistent Farmer',
      description: 'Maintained a 7-day activity streak',
      icon: 'https://img.icons8.com/color/48/calendar.png'
    });
  }
  
  // Score milestones
  if (this.lossPreventionScore >= 100 && !this.hasBadge('century')) {
    newBadges.push({
      type: 'century',
      name: 'Century Club',
      description: 'Reached 100 loss prevention points',
      icon: 'https://img.icons8.com/color/48/100.png'
    });
  }
  
  if (this.lossPreventionScore >= 500 && !this.hasBadge('high_scorer')) {
    newBadges.push({
      type: 'high_scorer',
      name: 'High Scorer',
      description: 'Reached 500 loss prevention points',
      icon: 'https://img.icons8.com/color/48/500.png'
    });
  }
  
  // Recommendation follower badge
  if (this.achievements.recommendationsFollowed >= 10 && !this.hasBadge('good_listener')) {
    newBadges.push({
      type: 'good_listener',
      name: 'Good Listener',
      description: 'Followed 10 system recommendations',
      icon: 'https://img.icons8.com/color/48/headphones.png'
    });
  }
  
  // Early intervention badge
  if (this.achievements.earlyInterventions >= 3 && !this.hasBadge('proactive')) {
    newBadges.push({
      type: 'proactive',
      name: 'Proactive Farmer',
      description: 'Made 3 early interventions to prevent loss',
      icon: 'https://img.icons8.com/color/48/alarm.png'
    });
  }
  
  this.badges.push(...newBadges);
  return newBadges;
};

// Check if farmer has a specific badge
gamificationSchema.methods.hasBadge = function(badgeType) {
  return this.badges.some(badge => badge.type === badgeType);
};

// Get next level and points needed
gamificationSchema.methods.getNextLevelInfo = function() {
  const currentScore = this.lossPreventionScore;
  let nextLevel, pointsNeeded;
  
  switch(this.level) {
    case "Beginner":
      nextLevel = "Intermediate";
      pointsNeeded = 200 - currentScore;
      break;
    case "Intermediate":
      nextLevel = "Advanced";
      pointsNeeded = 500 - currentScore;
      break;
    case "Advanced":
      nextLevel = "Expert";
      pointsNeeded = 1000 - currentScore;
      break;
    case "Expert":
      nextLevel = "Master";
      pointsNeeded = 2000 - currentScore;
      break;
    default:
      nextLevel = "Beginner";
      pointsNeeded = 200 - currentScore;
  }
  
  return { nextLevel, pointsNeeded: Math.max(0, pointsNeeded) };
};

module.exports = mongoose.model("Gamification", gamificationSchema);
