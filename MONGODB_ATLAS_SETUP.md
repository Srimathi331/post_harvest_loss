# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for the AI-Based Post-Harvest Loss Intelligence System.

## 🚀 Quick Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

### 2. Create a Free Cluster
1. Click "Build a Database" 
2. Choose "M0 Sandbox" (Free tier)
3. Select a cloud provider and region (closest to your users)
4. Name your cluster (e.g., "post-harvest-cluster")
5. Click "Create"

### 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Enter username (e.g., "postharvest_user")
4. Create a strong password
5. Select "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
4. For production, add your specific server IP addresses
5. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Choose "Node.js" as driver
5. Copy the connection string

### 6. Update Environment Variables
Create `.env` file in the backend directory:

```env
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://postharvest_user:YOUR_PASSWORD@post-harvest-cluster.xxxxx.mongodb.net/post_harvest_system?retryWrites=true&w=majority

# Other required variables
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
```

**Important:**
- Replace `YOUR_PASSWORD` with the actual password you created
- Replace `post-harvest-cluster.xxxxx` with your actual cluster name
- Keep the `?retryWrites=true&w=majority` parameters for reliability

## 🔧 Configuration Details

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-name>.<mongodb.net>/<database-name>?retryWrites=true&w=majority
```

### Environment Variables Explained
- `MONGO_URI`: Full MongoDB Atlas connection string
- `WEATHER_API_KEY`: Your OpenWeatherMap API key
- `PORT`: Backend server port (default: 5000)

## 🛡️ Security Best Practices

### For Development
- Use "Allow Access from Anywhere" (0.0.0.0/0)
- Use strong passwords
- Don't commit `.env` file to version control

### For Production
- Restrict IP access to your server's IP only
- Use environment-specific credentials
- Enable MongoDB Atlas security features
- Regularly rotate passwords
- Monitor database access logs

## 📊 Atlas Features Available

### Free Tier (M0)
- 512MB storage
- Shared RAM
- Shared vCPU
- Enough for development and small-scale testing

### Paid Tiers
- More storage and compute power
- Advanced security features
- Backup and restore
- Performance monitoring

## 🔍 Troubleshooting

### Common Issues

**Connection Timeout**
```bash
Error: connect ETIMEDOUT
```
- Solution: Check IP access list
- Verify cluster is running
- Check network connectivity

**Authentication Failed**
```bash
Error: Authentication failed
```
- Solution: Verify username/password
- Check user permissions
- Ensure database user exists

**Invalid Connection String**
```bash
Error: Invalid connection string
```
- Solution: Copy connection string directly from Atlas
- Replace placeholders correctly
- Check for special characters in password

### Testing Connection
Create a simple test file `test-connection.js` in backend:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ Connection error:', err.message));
```

Run with: `node test-connection.js`

## 📈 Monitoring

### Atlas Dashboard
- Monitor database performance
- View query statistics
- Check storage usage
- Set up alerts

### Recommended Alerts
- High CPU usage
- Memory usage
- Connection count
- Slow queries

## 🚀 Next Steps

Once MongoDB Atlas is configured:

1. **Start the AI Service:**
```bash
cd ai_service
python app.py
```

2. **Start the Backend:**
```bash
cd backend
npm start
```

3. **Start the Frontend:**
```bash
cd frontend
npm start
```

Your application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## 📞 Support

If you encounter issues:
- Check MongoDB Atlas documentation
- Review connection string format
- Verify network access settings
- Test with the provided connection test script

---

**🎯 You're now ready to use MongoDB Atlas with your Post-Harvest Loss Intelligence System!**
