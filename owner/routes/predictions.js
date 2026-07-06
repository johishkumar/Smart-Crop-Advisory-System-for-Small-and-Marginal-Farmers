const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePrediction } = require('../middleware/validation');

const router = express.Router();

// @desc    Get crop prediction
// @route   POST /api/predictions/crop
// @access  Private
router.post('/crop', protect, validatePrediction, async (req, res) => {
  try {
    const startTime = Date.now();
    const inputData = req.body;

    // Create prediction record
    const prediction = new Prediction({
      user: req.user.id,
      inputData,
      status: 'pending'
    });

    await prediction.save();

    try {
      // Prepare data for Python script
      const pythonData = {
        nitrogen: inputData.nitrogen,
        phosphorus: inputData.phosphorus,
        potassium: inputData.potassium,
        temperature: inputData.temperature,
        humidity: inputData.humidity,
        ph: inputData.ph,
        rainfall: inputData.rainfall,
        soil_type: inputData.soilType
      };

      // Run Python prediction script
      const options = {
        mode: 'json',
        pythonPath: 'python', // Use 'python' for Windows compatibility
        pythonOptions: ['-u'],
        scriptPath: path.join(__dirname, '../scripts'),
        args: [JSON.stringify(pythonData)]
      };

      console.log('Starting Python prediction script with options:', options);
      const results = await new Promise((resolve, reject) => {
        PythonShell.run('predict_crop.py', options, (err, results) => {
          if (err) {
            console.error('Python script error:', err);
            reject(err);
          } else {
            console.log('Python script finished, results:', results);
            resolve(results);
          }
        });
      });
      console.log('Prediction results received:', results);

      if (results && results.length > 0) {
        const predictionResult = results[0];
        
        // Update prediction with results
        prediction.predictions = predictionResult.predictions || [];
        prediction.recommendations = predictionResult.recommendations || [];
        prediction.marketData = predictionResult.marketData || {};
        prediction.status = 'completed';
        prediction.processingTime = Date.now() - startTime;
        prediction.modelVersion = predictionResult.modelVersion || '1.0';

        await prediction.save();

        // Add to user's prediction history
        await User.findByIdAndUpdate(req.user.id, {
          $push: { predictionHistory: prediction._id }
        });

        res.status(200).json({
          status: 'success',
          data: {
            prediction: prediction,
            processingTime: prediction.processingTime
          }
        });
      } else {
        throw new Error('No prediction results received');
      }
    } catch (pythonError) {
      console.error('Python prediction error:', pythonError);
      
      // Update prediction status to failed
      prediction.status = 'failed';
      prediction.processingTime = Date.now() - startTime;
      await prediction.save();

      res.status(500).json({
        status: 'error',
        message: 'Prediction failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? pythonError.message : undefined
      });
    }
  } catch (error) {
    console.error('Prediction route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during prediction'
    });
  }
});

// @desc    Get user's prediction history
// @route   GET /api/predictions/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const predictions = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Prediction.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      data: {
        predictions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get specific prediction by ID
// @route   GET /api/predictions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        status: 'error',
        message: 'Prediction not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { prediction }
    });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get prediction statistics
// @route   GET /api/predictions/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalPredictions: { $sum: 1 },
          avgProcessingTime: { $avg: '$processingTime' },
          successfulPredictions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedPredictions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get most recommended crops
    const topCrops = await Prediction.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $unwind: '$predictions' },
      {
        $group: {
          _id: '$predictions.crop',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$predictions.confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: stats[0] || {
          totalPredictions: 0,
          avgProcessingTime: 0,
          successfulPredictions: 0,
          failedPredictions: 0
        },
        topCrops
      }
    });
  } catch (error) {
    console.error('Get prediction stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const prediction = await Prediction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        status: 'error',
        message: 'Prediction not found'
      });
    }

    // Remove from user's prediction history
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { predictionHistory: prediction._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
