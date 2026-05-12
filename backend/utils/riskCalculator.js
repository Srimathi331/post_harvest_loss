const thresholds = require("../config/cropThresholds.json");

function calculateRisk(temp, humidity, cropType, rainfall = null, windSpeed = null) {
  const crop = thresholds[cropType.toLowerCase()] || thresholds["default"];
  let risk = "Low";

  // Temperature checks
  if (crop.temperature) {
    if (crop.temperature.high && temp > crop.temperature.high) risk = "High";
    else if (crop.temperature.medium && temp > crop.temperature.medium) risk = "Medium";
    else if (crop.temperature.low && temp < crop.temperature.low) risk = "High";
  }

  // Humidity checks
  if (crop.humidity) {
    if (crop.humidity.high && humidity > crop.humidity.high) risk = "High";
    else if (crop.humidity.medium && humidity > crop.humidity.medium) risk = "Medium";
    else if (crop.humidity.low && humidity < crop.humidity.low) risk = "High";
  }

  // Extra weather factors
  if (rainfall !== null && rainfall > 50) risk = "High"; // heavy rain
  if (windSpeed !== null && windSpeed > 40) risk = "High"; // strong winds

  return risk;
}

module.exports = calculateRisk;
