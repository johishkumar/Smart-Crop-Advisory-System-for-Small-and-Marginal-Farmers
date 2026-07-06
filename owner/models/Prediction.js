const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputData: {
    nitrogen: {
      type: Number,
      required: true,
      min: 0,
      max: 200
    },
    phosphorus: {
      type: Number,
      required: true,
      min: 0,
      max: 200
    },
    potassium: {
      type: Number,
      required: true,
      min: 0,
      max: 200
    },
    temperature: {
      type: Number,
      required: true,
      min: -50,
      max: 60
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    rainfall: {
      type: Number,
      required: true,
      min: 0,
      max: 3000
    },
    soilType: {
      type: String,
      required: true,
      enum: ['Sandy', 'Loamy', 'Clay', 'Black', 'Red', 'Laterite']
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  predictions: [{
    crop: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    suitability: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'Poor'],
      required: true
    },
    reasons: [String]
  }],
  marketData: {
    demand: String,
    priceRange: {
      min: Number,
      max: Number,
      currency: String
    },
    season: String,
    profitPotential: String
  },
  recommendations: [{
    type: String,
    description: String,
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  processingTime: Number, // in milliseconds
  modelVersion: String
}, {
  timestamps: true
});

// Index for efficient queries
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ 'inputData.location.latitude': 1, 'inputData.location.longitude': 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
