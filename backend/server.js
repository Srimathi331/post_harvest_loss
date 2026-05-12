// Import required modules
const express = require('express');   // Web framework
const mongoose = require('mongoose'); // MongoDB connection
const cors = require('cors');         // Cross-origin requests
require('dotenv').config();           // Load environment variables
const { MongoMemoryServer } = require('mongodb-memory-server');

// Initialize app
const app = express();
app.use(cors());          // Allow frontend requests
app.use(express.json());  // Parse JSON data

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ MongoDB connected");
      return;
    } catch (err) {
      console.error("❌ MongoDB connection failed. Falling back to in-memory MongoDB.", err?.message ?? err);
    }
  } else {
    console.warn("⚠️ MONGO_URI not set. Using in-memory MongoDB.");
  }

  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri(), { serverSelectionTimeoutMS: 5000 });
  console.log("✅ In-memory MongoDB started");
}

async function start() {
  try {
    await connectMongo();
    // Start server only after DB is ready (avoids request buffering timeouts)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Fatal DB init error:", err);
    process.exitCode = 1;
  }
}

// Simple test route
app.get('/', (req, res) => {
  res.send("Backend is running...");
});

// Import weather route
const weatherRoute = require('./routes/weather');
app.use('/weather', weatherRoute);

//import farmer route
const farmerRoute = require("./routes/farmer");
app.use("/farmer", farmerRoute);

//import crop batch route
const cropBatchRoute = require("./routes/cropBatch");
app.use("/cropbatch", cropBatchRoute);

//import market price route
const marketPriceRoute = require("./routes/marketPrice");
app.use("/market", marketPriceRoute);

//import regional analytics route
const regionalAnalyticsRoute = require("./routes/regionalAnalytics");
app.use("/analytics", regionalAnalyticsRoute);

//import gamification route
const gamificationRoute = require("./routes/gamification");
app.use("/game", gamificationRoute);

//import auth route
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

// Global error handler — catches unhandled errors from all routes
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

start();
