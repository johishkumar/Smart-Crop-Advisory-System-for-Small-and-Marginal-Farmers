const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PythonShell } = require('python-shell');
const path = require('path');
const ImageAnalysis = require('../models/ImageAnalysis');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @desc    Upload and analyze crop image
// @route   POST /api/images/analyze
// @access  Private
router.post('/analyze', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const startTime = Date.now();

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'crop-analysis',
          public_id: `crop_${Date.now()}_${req.user.id}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create image analysis record
    const imageAnalysis = new ImageAnalysis({
      user: req.user.id,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      location: req.body.location ? JSON.parse(req.body.location) : null,
      metadata: {
        captureDate: new Date(),
        weather: req.body.weather ? JSON.parse(req.body.weather) : null,
        cameraInfo: {
          device: req.body.device || 'Unknown',
          resolution: req.body.resolution || 'Unknown'
        }
      },
      status: 'processing'
    });

    await imageAnalysis.save();

    try {
      // Run Python image analysis script
      const options = {
        mode: 'json',
        // Use `python` on Windows; allow overriding via env.
        pythonPath: process.env.PYTHON_PATH || 'python',

        pythonOptions: ['-u'],
        scriptPath: path.join(__dirname, '../scripts'),
        args: [uploadResult.secure_url]
      };

      const results = await new Promise((resolve, reject) => {
        PythonShell.run('analyze_image.py', options, (err, results) => {
          if (err) {
            console.error('Python script error:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (results && results.length > 0) {
        const analysisResult = results[0];
        
        // Update image analysis with results
        imageAnalysis.analysis = analysisResult.analysis || {};
        imageAnalysis.status = 'completed';
        imageAnalysis.processingTime = Date.now() - startTime;

        await imageAnalysis.save();

        res.status(200).json({
          status: 'success',
          data: {
            imageAnalysis,
            processingTime: imageAnalysis.processingTime
          }
        });
      } else {
        throw new Error('No analysis results received');
      }
    } catch (pythonError) {
      console.error('Python analysis error:', pythonError);
      
      // Update analysis status to failed
      imageAnalysis.status = 'failed';
      imageAnalysis.processingTime = Date.now() - startTime;
      await imageAnalysis.save();

      res.status(500).json({
        status: 'error',
        message: 'Image analysis failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? pythonError.message : undefined
      });
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during image analysis'
    });
  }
});

// @desc    Get user's image analysis history
// @route   GET /api/images/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const imageAnalyses = await ImageAnalysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await ImageAnalysis.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      data: {
        imageAnalyses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get image history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get specific image analysis by ID
// @route   GET /api/images/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const imageAnalysis = await ImageAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!imageAnalysis) {
      return res.status(404).json({
        status: 'error',
        message: 'Image analysis not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { imageAnalysis }
    });
  } catch (error) {
    console.error('Get image analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Delete image analysis
// @route   DELETE /api/images/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const imageAnalysis = await ImageAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!imageAnalysis) {
      return res.status(404).json({
        status: 'error',
        message: 'Image analysis not found'
      });
    }

    // Delete image from Cloudinary
    if (imageAnalysis.image.publicId) {
      await cloudinary.uploader.destroy(imageAnalysis.image.publicId);
    }

    // Delete from database
    await ImageAnalysis.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Image analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete image analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Get image analysis statistics
// @route   GET /api/images/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await ImageAnalysis.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          avgProcessingTime: { $avg: '$processingTime' },
          successfulAnalyses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedAnalyses: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get most detected issues
    const topIssues = await ImageAnalysis.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $unwind: '$analysis.detectedIssues' },
      {
        $group: {
          _id: '$analysis.detectedIssues.type',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$analysis.detectedIssues.confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: stats[0] || {
          totalAnalyses: 0,
          avgProcessingTime: 0,
          successfulAnalyses: 0,
          failedAnalyses: 0
        },
        topIssues
      }
    });
  } catch (error) {
    console.error('Get image stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
