const express = require('express');
const axios = require('axios');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get market prices for crops
// @route   GET /api/market/prices
// @access  Public
router.get('/prices', optionalAuth, async (req, res) => {
  try {
    const { crop, location } = req.query;
    
    // Mock market data - in production, this would connect to real market APIs
    const marketData = {
      'Rice': {
        currentPrice: 28.50,
        currency: 'INR/kg',
        trend: 'up',
        changePercent: 2.5,
        demand: 'High',
        season: 'Year-round',
        regions: {
          'Punjab': { price: 29.00, trend: 'up' },
          'Haryana': { price: 28.50, trend: 'stable' },
          'Uttar Pradesh': { price: 27.80, trend: 'down' }
        }
      },
      'Wheat': {
        currentPrice: 25.20,
        currency: 'INR/kg',
        trend: 'stable',
        changePercent: 0.8,
        demand: 'Very High',
        season: 'Year-round',
        regions: {
          'Punjab': { price: 25.50, trend: 'up' },
          'Haryana': { price: 25.20, trend: 'stable' },
          'Madhya Pradesh': { price: 24.80, trend: 'down' }
        }
      },
      'Maize': {
        currentPrice: 22.80,
        currency: 'INR/kg',
        trend: 'up',
        changePercent: 3.2,
        demand: 'High',
        season: 'Year-round',
        regions: {
          'Karnataka': { price: 23.20, trend: 'up' },
          'Andhra Pradesh': { price: 22.80, trend: 'stable' },
          'Bihar': { price: 22.40, trend: 'up' }
        }
      },
      'Cotton': {
        currentPrice: 7200,
        currency: 'INR/quintal',
        trend: 'up',
        changePercent: 4.1,
        demand: 'High',
        season: 'Year-round',
        regions: {
          'Gujarat': { price: 7400, trend: 'up' },
          'Maharashtra': { price: 7200, trend: 'stable' },
          'Telangana': { price: 7100, trend: 'up' }
        }
      }
    };

    if (crop && marketData[crop]) {
      res.status(200).json({
        status: 'success',
        data: {
          crop,
          marketInfo: marketData[crop],
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          allCrops: marketData,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Get market prices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get market trends and analysis
// @route   GET /api/market/trends
// @access  Public
router.get('/trends', optionalAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Mock trend data - in production, this would be real market analysis
    const trends = {
      '30d': {
        topGainers: [
          { crop: 'Cotton', change: 8.5, price: 7200 },
          { crop: 'Sugarcane', change: 6.2, price: 320 },
          { crop: 'Maize', change: 4.8, price: 22.80 }
        ],
        topLosers: [
          { crop: 'Wheat', change: -2.1, price: 25.20 },
          { crop: 'Rice', change: -1.5, price: 28.50 }
        ],
        marketSentiment: 'Bullish',
        keyFactors: [
          'Increased export demand for cotton',
          'Government procurement support for wheat',
          'Weather concerns affecting rice production'
        ]
      },
      '90d': {
        topGainers: [
          { crop: 'Cotton', change: 15.2, price: 7200 },
          { crop: 'Sugarcane', change: 12.8, price: 320 },
          { crop: 'Maize', change: 9.5, price: 22.80 }
        ],
        topLosers: [
          { crop: 'Wheat', change: -3.2, price: 25.20 },
          { crop: 'Rice', change: -2.8, price: 28.50 }
        ],
        marketSentiment: 'Bullish',
        keyFactors: [
          'Strong export demand',
          'Government policy support',
          'Supply chain improvements'
        ]
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        period,
        trends: trends[period] || trends['30d'],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get market trends error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get demand forecast for crops
// @route   GET /api/market/demand-forecast
// @access  Public
router.get('/demand-forecast', optionalAuth, async (req, res) => {
  try {
    const { crop, region } = req.query;
    
    // Mock demand forecast data
    const demandForecast = {
      'Rice': {
        currentDemand: 'High',
        forecast: {
          '1month': { demand: 'High', confidence: 0.85 },
          '3months': { demand: 'Very High', confidence: 0.78 },
          '6months': { demand: 'High', confidence: 0.72 }
        },
        factors: [
          'Population growth',
          'Export opportunities',
          'Government procurement'
        ]
      },
      'Wheat': {
        currentDemand: 'Very High',
        forecast: {
          '1month': { demand: 'Very High', confidence: 0.92 },
          '3months': { demand: 'High', confidence: 0.88 },
          '6months': { demand: 'High', confidence: 0.85 }
        },
        factors: [
          'Staple food demand',
          'Government buffer stock',
          'Export potential'
        ]
      },
      'Cotton': {
        currentDemand: 'High',
        forecast: {
          '1month': { demand: 'High', confidence: 0.80 },
          '3months': { demand: 'Very High', confidence: 0.75 },
          '6months': { demand: 'High', confidence: 0.70 }
        },
        factors: [
          'Textile industry growth',
          'Export demand',
          'Fashion trends'
        ]
      }
    };

    if (crop && demandForecast[crop]) {
      res.status(200).json({
        status: 'success',
        data: {
          crop,
          demandForecast: demandForecast[crop],
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          allCrops: demandForecast,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Get demand forecast error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get weather impact on market
// @route   GET /api/market/weather-impact
// @access  Public
router.get('/weather-impact', optionalAuth, async (req, res) => {
  try {
    const { region } = req.query;
    
    // Mock weather impact data
    const weatherImpact = {
      'North India': {
        currentWeather: 'Normal',
        impact: 'Neutral',
        affectedCrops: [],
        forecast: 'Favorable conditions expected',
        recommendations: [
          'Continue normal farming practices',
          'Monitor soil moisture levels'
        ]
      },
      'South India': {
        currentWeather: 'Drought Risk',
        impact: 'Negative',
        affectedCrops: ['Rice', 'Sugarcane'],
        forecast: 'Below normal rainfall expected',
        recommendations: [
          'Implement water conservation measures',
          'Consider drought-resistant varieties',
          'Plan irrigation schedules carefully'
        ]
      },
      'East India': {
        currentWeather: 'Excessive Rainfall',
        impact: 'Mixed',
        affectedCrops: ['Rice', 'Jute'],
        forecast: 'Above normal rainfall expected',
        recommendations: [
          'Ensure proper drainage',
          'Protect crops from waterlogging',
          'Consider flood-resistant varieties'
        ]
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        region: region || 'All Regions',
        weatherImpact: region ? weatherImpact[region] : weatherImpact,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get weather impact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
