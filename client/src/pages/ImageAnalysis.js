import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';
import { imageAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ImageAnalysis = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch analysis history
  const { data: historyData, refetch: refetchHistory } = useQuery(
    'imageHistory',
    () => imageAPI.getHistory({ limit: 5 }),
    { refetchInterval: 30000 }
  );

  const analysisMutation = useMutation(imageAPI.analyzeImage, {
    onSuccess: (response) => {
      setAnalysisResult(response.data.imageAnalysis);
      setIsAnalyzing(false);
      refetchHistory();
      toast.success('Image analysis completed successfully!');
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(error.response?.data?.message || 'Analysis failed. Please try again.');
    }
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setAnalysisResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', uploadedImage);
    
    // Add optional metadata
    formData.append('device', 'Web Browser');
    formData.append('resolution', 'Unknown');

    analysisMutation.mutate(formData);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIssueTypeColor = (type) => {
    switch (type) {
      case 'pest': return 'text-red-600 bg-red-100';
      case 'disease': return 'text-orange-600 bg-orange-100';
      case 'nutrient_deficiency': return 'text-yellow-600 bg-yellow-100';
      case 'healthy': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Fair': return 'text-yellow-600 bg-yellow-100';
      case 'Poor': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center">
            <Camera className="h-8 w-8 text-secondary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Image Analysis
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload crop images for instant pest and disease detection using advanced computer vision technology.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
            </div>
            <div className="card-body">
              {!uploadedImage ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex justify-center mb-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  {isDragActive ? (
                    <p className="text-lg font-medium text-primary-600">
                      Drop the image here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag & drop an image here
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        or click to select a file
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: JPEG, PNG, GIF, BMP, WebP (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="Uploaded crop"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>File:</strong> {uploadedImage.name}</p>
                    <p><strong>Size:</strong> {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {uploadedImage.type}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="btn-primary flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Analyze Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn-secondary"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {analysisResult ? (
            <div className="space-y-6">
              {/* Overall Health */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Overall Health</h2>
                </div>
                <div className="card-body">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold mb-4 ${getHealthColor(analysisResult.analysis.overallHealth)}`}>
                      {analysisResult.analysis.overallHealth}
                    </div>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(analysisResult.analysis.confidence * 100)}%
                    </p>
                    {analysisResult.analysis.cropType && (
                      <p className="text-sm text-gray-600 mt-2">
                        Detected Crop: <span className="font-medium">{analysisResult.analysis.cropType}</span>
                      </p>
                    )}
                    {analysisResult.analysis.growthStage && (
                      <p className="text-sm text-gray-600">
                        Growth Stage: <span className="font-medium">{analysisResult.analysis.growthStage}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detected Issues */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Detected Issues</h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {analysisResult.analysis.detectedIssues?.map((issue, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${getIssueTypeColor(issue.type)}`}>
                              {issue.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`badge ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(issue.confidence * 100)}% confidence
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {issue.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {issue.description}
                        </p>
                        
                        {issue.recommendations?.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {issue.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-start">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {issue.treatmentOptions?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment Options:</h4>
                            <div className="space-y-2">
                              {issue.treatmentOptions.map((treatment, treatIndex) => (
                                <div key={treatIndex} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-medium text-gray-900">{treatment.name}</h5>
                                    <span className="text-xs text-gray-500">{treatment.cost}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">{treatment.description}</p>
                                  <p className="text-xs text-gray-500">Effectiveness: {treatment.effectiveness}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Metadata */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Analysis Details</h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Processing Time</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysisResult.processingTime}ms
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Analysis Date</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(analysisResult.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Status</h4>
                      <span className={`badge ${
                        analysisResult.status === 'completed' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {analysisResult.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Issues Found</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysisResult.analysis.detectedIssues?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-gray-600">
                  Upload a crop image to get instant AI-powered analysis for pest and disease detection.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Analyses */}
      {historyData?.data?.imageAnalyses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {historyData.data.imageAnalyses.map((analysis) => (
                  <div key={analysis._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={analysis.image.url}
                      alt="Analysis"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`badge ${getHealthColor(analysis.analysis.overallHealth)}`}>
                          {analysis.analysis.overallHealth}
                        </span>
                        <span className={`badge ${
                          analysis.status === 'completed' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {analysis.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {analysis.analysis.detectedIssues?.length || 0} issues detected
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary btn-sm">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="btn-secondary btn-sm">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageAnalysis;
