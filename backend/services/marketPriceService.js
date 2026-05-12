const axios = require('axios');
const MarketPriceCache = require('../models/MarketPriceCache');

class MarketPriceService {
  constructor() {
    this.agrimarketApiUrl = 'https://api.agrimarket.in/v1';
    this.commodityApiUrl = 'https://api.commodity.com/prices';
  }

  async getMarketPrice(cropType, region = '') {
    try {
      // Check cache first
      const cacheKey = `${cropType}_${region}`.toLowerCase();
      const cached = await MarketPriceCache.findOne({ cropType: cacheKey });
      
      if (cached && cached.fetchedAt && (Date.now() - new Date(cached.fetchedAt).getTime()) < 3600000) { // 1 hour cache
        return {
          price: cached.currentPrice,
          trend: cached.trend,
          source: cached.source,
          cached: true
        };
      }

      // Fetch fresh data
      const priceData = await this.fetchPriceFromAPI(cropType, region);
      
      // Update cache
      await MarketPriceCache.updateOne(
        { cropType: cacheKey },
        {
          currentPrice: priceData.price,
          thirtyDayAverage: priceData.price,
          trend: priceData.trend,
          source: priceData.source,
          fetchedAt: new Date()
        },
        { upsert: true }
      );

      return priceData;
    } catch (error) {
      console.error('Market price fetch error:', error.message);
      return this.getDefaultPrice(cropType);
    }
  }

  async fetchPriceFromAPI(cropType, region) {
    // Mock API call - replace with actual API integration
    const mockPrices = {
      'banana': { price: 25, trend: 'stable' },
      'rice': { price: 35, trend: 'rising' },
      'wheat': { price: 28, trend: 'falling' },
      'onion': { price: 20, trend: 'stable' }
    };

    const cropLower = cropType.toLowerCase();
    const priceInfo = mockPrices[cropLower] || { price: 30, trend: 'stable' };

    return {
      price: priceInfo.price,
      trend: priceInfo.trend,
      source: 'mock_api',
      region: region
    };
  }

  getDefaultPrice(cropType) {
    return {
      price: 30,
      trend: 'stable',
      source: 'default',
      cached: false
    };
  }

  async getPriceTrend(cropType, days = 7) {
    // Mock historical data - replace with actual API
    const mockTrends = {
      'banana': [22, 23, 24, 25, 25, 26, 25],
      'rice': [32, 33, 34, 35, 35, 36, 35],
      'wheat': [30, 29, 28, 28, 27, 28, 28],
      'onion': [18, 19, 20, 20, 21, 20, 20]
    };

    const prices = mockTrends[cropType.toLowerCase()] || [28, 29, 30, 30, 31, 30, 30];
    const trend = prices[prices.length - 1] > prices[0] ? 'rising' : 
                  prices[prices.length - 1] < prices[0] ? 'falling' : 'stable';

    return {
      historical: prices,
      trend,
      change: prices[prices.length - 1] - prices[0]
    };
  }
}

module.exports = new MarketPriceService();
