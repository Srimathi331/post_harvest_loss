# AI-Based Post-Harvest Loss Intelligence System

A comprehensive MERN stack application that helps farmers reduce post-harvest losses through real-time weather monitoring, AI-powered risk assessment, and actionable recommendations.

## 🎯 Problem Statement

Farmers lose a significant portion of crops after harvest due to poor storage, unpredictable weather, and market delays. This system provides real-time intelligence to help farmers and policymakers make informed decisions to minimize losses.

## 🛠️ Core Features

### For Farmers
- **Real-time Risk Assessment**: AI-powered analysis of weather conditions and storage methods
- **Traffic-Light Indicators**: Visual risk levels (Green/Yellow/Red) with detailed explanations
- **Market Integration**: Current crop prices and trend analysis
- **Gamification**: Earn points and badges for following recommendations
- **Multilingual Support**: English, Tamil, and Hindi interfaces

### For Policymakers
- **Regional Analytics**: Comprehensive dashboards showing risk hotspots
- **Heat Maps**: Visual representation of crop loss risks across regions
- **Export Reports**: CSV, Excel, and PDF reports for decision-making
- **Storage Analysis**: Effectiveness comparison of different storage methods

## 🏗️ System Architecture

### Frontend (React.js)
- Farmer Dashboard with risk indicators
- Policymaker Dashboard with regional analytics
- Interactive maps using Leaflet
- Charts and visualizations using Chart.js
- Responsive design with modern UI

### Backend (Node.js + Express)
- RESTful APIs for all operations
- MongoDB integration for data persistence
- Weather API integration (OpenWeatherMap)
- Market price integration
- Real-time risk calculations

### AI Service (Python Flask)
- Machine learning risk prediction models
- Explainable AI with factor contributions
- Batch processing capabilities
- Custom crop-specific thresholds

### Database (MongoDB)
- User and farmer profiles
- Crop batch tracking
- Risk assessments and predictions
- Gamification data
- Market price caching

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AI-Based Post-Harvest Loss Intelligence System
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **AI Service Setup**
```bash
cd ai_service
pip install flask flask-cors
```

5. **Environment Configuration**
Create `.env` file in backend directory:
```
MONGO_URI=mongodb://localhost:27017/post_harvest_system
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
```

6. **Start MongoDB**
```bash
mongod
```

7. **Run the Application**

Start the AI Service:
```bash
cd ai_service
python app.py
```

Start the Backend:
```bash
cd backend
npm start
```

Start the Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Farmers
- `GET /farmer` - Get all farmers
- `POST /farmer` - Register new farmer
- `GET /farmer/:id` - Get farmer by ID

### Crop Batches
- `GET /cropbatch` - Get all crop batches
- `POST /cropbatch` - Create new crop batch
- `GET /cropbatch/:id/risk-assessment` - Get risk assessment for batch
- `PUT /cropbatch/:id/risk` - Update risk assessment

### Weather
- `GET /weather/coords/:lat/:lon` - Get weather by coordinates
- `GET /weather/farmer/:id` - Get weather for farmer location
- `GET /weather/farmers/risk` - Get risk for all farmers

### Market Prices
- `GET /market/:cropType` - Get current market price
- `GET /market/:cropType/trend` - Get price trend
- `POST /market/batch` - Get multiple crop prices

### Regional Analytics
- `GET /analytics/risk-summary` - Regional risk summary
- `GET /analytics/crop-analysis/:cropType` - Crop-specific analysis
- `GET /analytics/risk-trends` - Time-based risk trends
- `GET /analytics/storage-analysis` - Storage method effectiveness

### Gamification
- `GET /game/farmer/:farmerId` - Get farmer gamification profile
- `POST /game/farmer/:farmerId/add-points` - Add points for actions
- `GET /game/leaderboard` - Get global leaderboard
- `GET /game/leaderboard/region/:region` - Get regional leaderboard

## 🎮 Gamification System

### Points System
- **Batch Management**: 10 points per batch
- **Risk Mitigation**: 20-50 points based on risk level
- **Following Recommendations**: 10-25 points
- **Early Interventions**: 30 points
- **Daily Activity**: 5 points (streak bonus)

### Badge System
- **First Steps**: First crop batch managed
- **Risk Manager**: 5 risks mitigated
- **Consistent Farmer**: 7-day activity streak
- **Century Club**: 100 points achieved
- **High Scorer**: 500 points achieved
- **Good Listener**: 10 recommendations followed
- **Proactive Farmer**: 3 early interventions

### Levels
- **Beginner**: 0-199 points
- **Intermediate**: 200-499 points
- **Advanced**: 500-999 points
- **Expert**: 1000+ points

## 🌍 Multilingual Support

The system supports multiple languages:
- **English**: Default language
- **Tamil**: தமிழ் (Tamil script)
- **Hindi**: हिंदी (Devanagari script)

Language can be switched from the user profile settings.

## 📈 Risk Assessment Algorithm

The AI system considers multiple factors:
- **Weather Conditions**: Temperature, humidity, rainfall, wind speed
- **Storage Method**: Open air, warehouse, cold storage, refrigerated transport
- **Days Since Harvest**: Time-based degradation
- **Crop Type**: Specific thresholds for different crops
- **Market Trends**: Price volatility affecting decisions

### Risk Levels
- **Green (0-39)**: Low risk, continue current storage
- **Yellow (40-69)**: Medium risk, monitor closely
- **Red (70-100)**: High risk, immediate action required

## 🔧 Configuration

### Crop Thresholds
Edit `backend/config/cropThresholds.json` to customize crop-specific parameters:

```json
{
  "banana": {
    "humidity": { "medium": 60, "high": 80 },
    "temperature": { "low": 20 }
  },
  "rice": {
    "humidity": { "medium": 60, "low": 40 },
    "temperature": { "high": 38 }
  }
}
```

### Market Price APIs
Configure market data sources in `backend/services/marketPriceService.js`.

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones (iOS and Android)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting on API endpoints

## 📊 Monitoring and Analytics

- Real-time risk monitoring
- Performance metrics
- User activity tracking
- System health checks
- Error logging and reporting

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- OpenWeatherMap API key

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd AI-Based Post-Harvest Loss Intelligence System
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **AI Service Setup**
```bash
cd ai_service
pip install flask flask-cors
```

5. **Environment Configuration**
Create `.env` file in backend directory:
```
MONGO_URI=mongodb://localhost:27017/post_harvest_system
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
```

6. **Start MongoDB**
```bash
mongod
```

7. **Run the Application**

Start AI Service:
```bash
cd ai_service
python app.py
```

Start Backend:
```bash
cd backend
npm start
```

Start Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## 🚀 Production Deployment

For production deployment:
1. Set up production MongoDB instance
2. Configure environment variables
3. Build and deploy React frontend
4. Deploy Node.js backend with PM2
5. Set up Python AI service with Gunicorn
6. Configure reverse proxy (Nginx)
7. Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@postharvest-intelligence.com
- Documentation: [Wiki Link]
- Issues: [GitHub Issues]

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- Chart.js for visualizations
- Leaflet for mapping
- MongoDB for database
- React and Node.js communities

---

**Built with ❤️ for farmers and agricultural communities**
