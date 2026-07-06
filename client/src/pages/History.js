import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  History as HistoryIcon, 
  BarChart3, 
  Camera, 
  Calendar, 
  MapPin, 
  Trash2, 
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { predictionAPI, imageAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const History = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch prediction history
  const { data: predictionHistory, isLoading: predictionLoading, refetch: refetchPredictions } = useQuery(
    'predictionHistory',
    () => predictionAPI.getHistory({ limit: 50 }),
    { refetchInterval: 30000 }
  );

  // Fetch image analysis history
  const { data: imageHistory, isLoading: imageLoading, refetch: refetchImages } = useQuery(
    'imageHistory',
    () => imageAPI.getHistory({ limit: 50 }),
    { refetchInterval: 30000 }
  );

  const handleDeletePrediction = async (id) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      try {
        await predictionAPI.deletePrediction(id);
        refetchPredictions();
        toast.success('Prediction deleted successfully');
      } catch (error) {
        toast.error('Failed to delete prediction');
      }
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm('Are you sure you want to delete this image analysis?')) {
      try {
        await imageAPI.deleteAnalysis(id);
        refetchImages();
        toast.success('Image analysis deleted successfully');
      } catch (error) {
        toast.error('Failed to delete image analysis');
      }
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Poor': return 'text-red-600 bg-red-100';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterData = (data, searchTerm, dateFilter) => {
    let filtered = data || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if (activeTab === 'predictions') {
          return item.predictions?.some(p => 
            p.crop.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          return item.analysis?.cropType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.analysis?.detectedIssues?.some(issue => 
                   issue.name.toLowerCase().includes(searchTerm.toLowerCase())
                 );
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.createdAt) >= filterDate);
    }

    return filtered;
  };

  const filteredPredictions = filterData(predictionHistory?.data?.predictions, searchTerm, dateFilter);
  const filteredImages = filterData(imageHistory?.data?.imageAnalyses, searchTerm, dateFilter);

  if (predictionLoading || imageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <HistoryIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analysis History
        </h1>
        <p className="text-lg text-gray-600">
          View and manage your crop predictions and image analyses
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="border-b border-gray-200"
      >
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'predictions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Crop Predictions</span>
            <span className="badge badge-gray">
              {predictionHistory?.data?.predictions?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'images'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Image Analyses</span>
            <span className="badge badge-gray">
              {imageHistory?.data?.imageAnalyses?.length || 0}
            </span>
          </button>
        </nav>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder={`Search ${activeTab}...`}
                />
              </div>
            </div>
            <div>
              <label className="label">Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                }}
                className="btn-secondary w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {activeTab === 'predictions' ? (
          <div className="space-y-4">
            {filteredPredictions.length > 0 ? (
              filteredPredictions.map((prediction) => (
                <div key={prediction._id} className="card">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-primary-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Crop Prediction
                          </h3>
                          <span className={`badge ${getStatusColor(prediction.status)}`}>
                            {prediction.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Recommended Crops</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prediction.predictions?.map((pred, index) => (
                                <span key={index} className="badge badge-primary">
                                  {pred.crop}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Confidence</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prediction.predictions?.map((pred, index) => (
                                <span key={index} className={`badge ${getConfidenceColor(pred.confidence)}`}>
                                  {Math.round(pred.confidence * 100)}%
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Soil Type</h4>
                            <p className="text-sm text-gray-900">{prediction.inputData.soilType}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Processing Time</h4>
                            <p className="text-sm text-gray-900">{prediction.processingTime}ms</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(prediction.createdAt)}
                          </div>
                          {prediction.inputData.location?.address && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {prediction.inputData.location.address}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="btn-secondary btn-sm">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn-secondary btn-sm">
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrediction(prediction._id)}
                          className="btn-danger btn-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card">
                <div className="card-body text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No predictions found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || dateFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by making your first crop prediction'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredImages.length > 0 ? (
              filteredImages.map((analysis) => (
                <div key={analysis._id} className="card">
                  <div className="card-body">
                    <div className="flex items-start space-x-4">
                      <img
                        src={analysis.image.url}
                        alt="Analysis"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Camera className="h-5 w-5 text-secondary-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Image Analysis
                          </h3>
                          <span className={`badge ${getStatusColor(analysis.status)}`}>
                            {analysis.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Overall Health</h4>
                            <span className={`badge ${getHealthColor(analysis.analysis.overallHealth)}`}>
                              {analysis.analysis.overallHealth}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Issues Detected</h4>
                            <p className="text-sm text-gray-900">
                              {analysis.analysis.detectedIssues?.length || 0}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Crop Type</h4>
                            <p className="text-sm text-gray-900">
                              {analysis.analysis.cropType || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Processing Time</h4>
                            <p className="text-sm text-gray-900">{analysis.processingTime}ms</p>
                          </div>
                        </div>

                        {analysis.analysis.detectedIssues?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Issues:</h4>
                            <div className="flex flex-wrap gap-1">
                              {analysis.analysis.detectedIssues.map((issue, index) => (
                                <span key={index} className="badge badge-warning">
                                  {issue.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(analysis.createdAt)}
                          </div>
                          {analysis.location?.address && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {analysis.location.address}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="btn-secondary btn-sm">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn-secondary btn-sm">
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(analysis._id)}
                          className="btn-danger btn-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card">
                <div className="card-body text-center py-12">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No image analyses found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || dateFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by uploading your first crop image for analysis'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;
