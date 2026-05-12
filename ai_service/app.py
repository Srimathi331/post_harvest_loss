import json
import os
from datetime import datetime, date
from flask import Flask, request, jsonify

app = Flask(__name__)

THRESHOLDS_PATH = os.path.join(os.path.dirname(__file__), "../backend/config/cropThresholds.json")

WEIGHTS = {"humidity": 30, "temperature": 25, "days_since_harvest": 20, "rainfall": 15, "storage_method": 10}

STORAGE_PENALTY = {"open_air": 1.0, "dry_warehouse": 0.6, "cold_storage": 0.2, "refrigerated_transport": 0.1}

RISK_LEVEL_MAP = [(70, "Red"), (40, "Yellow"), (0, "Green")]

CROP_ADVICE = {
    "banana": {
        "Red": [
            "Bananas are highly perishable — move to a ventilated dry warehouse immediately",
            "Avoid cold storage below 13°C as bananas suffer chilling injury",
            "Remove any bruised or overripe bananas to prevent ethylene spread",
        ],
        "Yellow": [
            "Bananas are sensitive to ethylene — separate ripening batches from fresh stock",
            "Maintain storage temperature between 13–15°C to slow ripening",
            "Check for black spots or soft patches daily",
        ],
        "Green": [
            "Banana conditions are stable — maintain current ventilated storage",
            "Keep away from direct sunlight to prevent premature ripening",
        ],
    },
    "onion": {
        "Red": [
            "Onions are at high risk of rotting — reduce humidity immediately",
            "Spread onions in thin layers to improve air circulation",
            "Remove any sprouting or soft onions to prevent spread of decay",
        ],
        "Yellow": [
            "Humidity is rising — move onions to a dry, well-ventilated shed",
            "Avoid stacking onions in deep piles; use mesh bags or crates",
            "Check for neck rot or mold every 2–3 days",
        ],
        "Green": [
            "Onion storage is safe — keep in cool, dry, dark conditions",
            "Ensure good airflow around storage bags to prevent moisture buildup",
        ],
    },
    "rice": {
        "Red": [
            "Rice is at high risk of fungal growth — move to dry warehouse immediately",
            "Moisture content must be below 14% — use drying equipment if available",
            "Seal bags tightly and use hermetic storage to prevent insect infestation",
        ],
        "Yellow": [
            "Monitor moisture levels closely — rice absorbs humidity quickly",
            "Use silica gel or desiccants in storage area to reduce moisture",
            "Inspect for weevils or discoloration every few days",
        ],
        "Green": [
            "Rice storage conditions are good — maintain dry and cool environment",
            "Keep bags off the floor on pallets to avoid ground moisture",
        ],
    },
    "wheat": {
        "Red": [
            "Wheat is at risk of mold and pest damage — move to sealed dry storage",
            "Temperature above optimal range accelerates spoilage — use fans or cooling",
            "Check for grain weevils and apply approved grain protectant if needed",
        ],
        "Yellow": [
            "Wheat moisture is a concern — ensure storage area is well-ventilated",
            "Avoid mixing new and old wheat batches to prevent cross-contamination",
            "Monitor for heating in grain piles — turn grain if temperature rises",
        ],
        "Green": [
            "Wheat storage is stable — maintain dry conditions below 12% moisture",
            "Regularly inspect for pest activity and seal any entry points",
        ],
    },
    "tomato": {
        "Red": [
            "Tomatoes are highly perishable — sell or process within 24 hours",
            "Move to cold storage (10–13°C) immediately to slow deterioration",
            "Remove damaged or overripe tomatoes to prevent ethylene-triggered ripening",
        ],
        "Yellow": [
            "Tomatoes are ripening fast — consider selling within 48 hours",
            "Store in single layers to avoid bruising from weight",
            "Keep away from direct sunlight and high humidity",
        ],
        "Green": [
            "Tomato conditions are safe — maintain cool, dry storage",
            "Check daily for any signs of cracking or mold",
        ],
    },
    "potato": {
        "Red": [
            "Potatoes are at risk of sprouting and rot — move to cool dark storage immediately",
            "Ideal storage is 4–7°C with 90–95% humidity — use cold storage if available",
            "Remove any green or sprouting potatoes to prevent solanine spread",
        ],
        "Yellow": [
            "Potatoes are showing stress — reduce light exposure to prevent greening",
            "Ensure storage temperature is below 10°C to slow sprouting",
            "Check for soft spots or black rot every few days",
        ],
        "Green": [
            "Potato storage is stable — keep in cool, dark, well-ventilated conditions",
            "Avoid storing near onions as they accelerate each other's spoilage",
        ],
    },
}

MARKET_ADVICE = {
    "rising": {
        "Red": "Price is rising — sell within 24 hours to maximize returns before quality drops",
        "Yellow": "Price is rising — consider selling within 48 hours while conditions allow",
        "Green": "Price is rising — good time to plan early sale for premium returns",
    },
    "falling": {
        "Red": "Price is falling — prioritize quality preservation over waiting for better prices",
        "Yellow": "Price is falling — focus on reducing losses through better storage",
        "Green": "Price is falling — hold stock in safe storage and wait for price recovery",
    },
    "stable": {
        "Red": "Contact your local agricultural officer for emergency support",
        "Yellow": "Monitor market prices daily and plan sale timing accordingly",
        "Green": "Stable prices — no urgency to sell, maintain current storage",
    },
}

def generate_recommendations(crop_type, risk_level, market_price_trend, temperature, humidity, days, storage_method):
    crop_key = crop_type.lower()
    crop_recs = CROP_ADVICE.get(crop_key, {})
    level_recs = crop_recs.get(risk_level, [
        # Generic fallback if crop not in CROP_ADVICE
        "Move to cold storage immediately" if risk_level == "Red" else
        "Monitor conditions closely — consider moving to dry warehouse" if risk_level == "Yellow" else
        "Conditions are safe — continue current storage"
    ])

    recommendations = list(level_recs)  # copy so we don't mutate the constant

    # Add market-aware advice
    market_rec = MARKET_ADVICE.get(market_price_trend, MARKET_ADVICE["stable"]).get(risk_level, "")
    if market_rec:
        recommendations.append(market_rec)

    # Add specific condition warnings
    if days > 30:
        recommendations.append(f"Crop has been stored for {days} days — prioritize selling or processing soon")
    if storage_method == "open_air" and risk_level != "Green":
        recommendations.append("Open-air storage significantly increases risk — move to covered storage")

    return recommendations




def load_thresholds():
    with open(THRESHOLDS_PATH, "r") as f:
        return json.load(f)

def get_days_since_harvest(harvest_date_str):
    try:
        harvest = datetime.strptime(harvest_date_str, "%Y-%m-%d").date()
        return (date.today() - harvest).days
    except Exception:
        return 0

def normalize(value, low, high):
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))

def score_to_level(score):
    for threshold, level in RISK_LEVEL_MAP:
        if score >= threshold:
            return level
    return "Green"

def calculate_risk(crop_type, harvest_date, storage_method, temperature, humidity, rainfall, market_price_trend="stable"):
    thresholds = load_thresholds()
    crop = thresholds.get(crop_type.lower(), thresholds.get("default", {}))
    days = get_days_since_harvest(harvest_date) if harvest_date else 0
    storage_penalty = STORAGE_PENALTY.get(storage_method, 1.0)

    hum_low = crop.get("humidity", {}).get("medium", 50)
    hum_high = crop.get("humidity", {}).get("high", 80)
    temp_high = crop.get("temperature", {}).get("high", 35)
    temp_medium = crop.get("temperature", {}).get("medium", 25)

    factors = []

    hum_norm = normalize(humidity, hum_low, hum_high)
    factors.append({"factor": "humidity", "value": humidity, "threshold": hum_high,
                    "contribution": round(hum_norm * WEIGHTS["humidity"], 2), "exceeded": humidity > hum_high})

    temp_norm = normalize(temperature, temp_medium, temp_high)
    factors.append({"factor": "temperature", "value": temperature, "threshold": temp_high,
                    "contribution": round(temp_norm * WEIGHTS["temperature"], 2), "exceeded": temperature > temp_high})

    days_norm = normalize(days, 7, 21)
    factors.append({"factor": "days_since_harvest", "value": days, "threshold": 21,
                    "contribution": round(days_norm * WEIGHTS["days_since_harvest"], 2), "exceeded": days > 21})

    rain_norm = normalize(rainfall, 5, 50)
    factors.append({"factor": "rainfall", "value": rainfall, "threshold": 50,
                    "contribution": round(rain_norm * WEIGHTS["rainfall"], 2), "exceeded": rainfall > 50})

    storage_contrib = round(storage_penalty * WEIGHTS["storage_method"], 2)
    factors.append({"factor": "storage_method", "value": storage_method, "threshold": "cold_storage",
                    "contribution": storage_contrib, "exceeded": storage_penalty > 0.5})

    raw_score = sum(f["contribution"] for f in factors)
    risk_score = int(min(100, max(0, round(raw_score))))
    risk_level = score_to_level(risk_score)

    sorted_factors = sorted(factors, key=lambda x: x["contribution"], reverse=True)
    explanation = sorted_factors[:max(2, sum(1 for f in sorted_factors if f["contribution"] > 0))]

    recommendations = generate_recommendations(crop_type, risk_level, market_price_trend, temperature, humidity, days, storage_method)

    return {"riskScore": risk_score, "riskLevel": risk_level, "explanation": explanation, "recommendations": recommendations}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['crop_type', 'harvest_date', 'storage_method', 'temperature', 'humidity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Extract parameters
        crop_type = data['crop_type']
        harvest_date = data['harvest_date']
        storage_method = data['storage_method']
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        rainfall = float(data.get('rainfall', 0))
        market_price_trend = data.get('market_price_trend', 'stable')
        
        # Calculate risk
        result = calculate_risk(
            crop_type, harvest_date, storage_method, 
            temperature, humidity, rainfall, market_price_trend
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "AI Risk Prediction Service"})

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    try:
        data = request.get_json()
        batch_requests = data.get('batches', [])
        
        if not isinstance(batch_requests, list):
            return jsonify({"error": "batches must be an array"}), 400
        
        results = []
        for batch_data in batch_requests:
            try:
                result = calculate_risk(
                    batch_data['crop_type'],
                    batch_data['harvest_date'],
                    batch_data['storage_method'],
                    batch_data['temperature'],
                    batch_data['humidity'],
                    batch_data.get('rainfall', 0),
                    batch_data.get('market_price_trend', 'stable')
                )
                results.append({"batch_id": batch_data.get('batch_id'), "result": result})
            except Exception as e:
                results.append({"batch_id": batch_data.get('batch_id'), "error": str(e)})
        
        return jsonify({"results": results})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
