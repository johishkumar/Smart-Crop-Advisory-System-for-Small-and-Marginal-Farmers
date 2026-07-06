const mongoose = require('mongoose');

const imageAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    url: {
      type: String,
      required: true
    },
    publicId: String,
    originalName: String,
    size: Number,
    mimeType: String
  },
  analysis: {
    detectedIssues: [{
      type: {
        type: String,
        enum: ['pest', 'disease', 'nutrient_deficiency', 'healthy'],
        required: true
      },
      name: String,
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical']
      },
      description: String,
      recommendations: [String],
      treatmentOptions: [{
        name: String,
        description: String,
        effectiveness: String,
        cost: String
      }]
    }],
    cropType: String,
    growthStage: String,
    overallHealth: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
    },
    confidence: Number
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  metadata: {
    captureDate: Date,
    weather: {
      temperature: Number,
      humidity: Number,
      rainfall: Number
    },
    cameraInfo: {
      device: String,
      resolution: String
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  processingTime: Number
}, {
  timestamps: true
});

// Index for efficient queries
imageAnalysisSchema.index({ user: 1, createdAt: -1 });
imageAnalysisSchema.index({ 'analysis.detectedIssues.type': 1 });

module.exports = mongoose.model('ImageAnalysis', imageAnalysisSchema);
