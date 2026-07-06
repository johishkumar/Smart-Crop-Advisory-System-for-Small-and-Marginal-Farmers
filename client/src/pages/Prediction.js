import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  BarChart3, 
  MapPin, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Leaf,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { predictionAPI, marketAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Prediction = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { translate } = useLanguage();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: '',
      soilType: '',
      location: {
        latitude: '',
        longitude: '',
        address: ''
      }
    }
  });

  // Fetch market data for the predicted crop
  const { data: marketData } = useQuery(
    ['marketData', predictionResult?.predictions?.[0]?.crop],
    () => marketAPI.getPrices({ crop: predictionResult?.predictions?.[0]?.crop }),
    { enabled: !!predictionResult?.predictions?.[0]?.crop }
  );

  const predictionMutation = useMutation(predictionAPI.predictCrop, {
    onSuccess: (response) => {
      setPredictionResult(response.data.prediction);
      setIsAnalyzing(false);
      toast.success('Crop prediction completed successfully!');
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(error.response?.data?.message || 'Prediction failed. Please try again.');
    }
  });

  const onSubmit = async (data) => {
    setIsAnalyzing(true);
    setPredictionResult(null);
    
    // Convert string values to numbers
    const numericData = {
      ...data,
      nitrogen: parseFloat(data.nitrogen),
      phosphorus: parseFloat(data.phosphorus),
      potassium: parseFloat(data.potassium),
      temperature: parseFloat(data.temperature),
      humidity: parseFloat(data.humidity),
      ph: parseFloat(data.ph),
      rainfall: parseFloat(data.rainfall),
      location: {
        latitude: parseFloat(data.location.latitude) || null,
        longitude: parseFloat(data.location.longitude) || null,
        address: data.location.address || null
      }
    };

    predictionMutation.mutate(numericData);
  };

  const soilTypes = [
    'Sandy', 'Loamy', 'Clay', 'Black', 'Red', 'Laterite'
  ];

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
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Crop Prediction
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter your soil and environmental conditions to get personalized crop recommendations
          with confidence scores and market insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Soil & Environmental Data</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Soil Nutrients */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Soil Nutrients (kg/ha)
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="label">Nitrogen (N)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('nitrogen', { 
                          required: 'Nitrogen is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 200, message: 'Must be less than 200' }
                        })}
                        className={`input ${errors.nitrogen ? 'input-error' : ''}`}
                        placeholder="0-200"
                      />
                      {errors.nitrogen && (
                        <p className="mt-1 text-sm text-red-600">{errors.nitrogen.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Phosphorus (P)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('phosphorus', { 
                          required: 'Phosphorus is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 200, message: 'Must be less than 200' }
                        })}
                        className={`input ${errors.phosphorus ? 'input-error' : ''}`}
                        placeholder="0-200"
                      />
                      {errors.phosphorus && (
                        <p className="mt-1 text-sm text-red-600">{errors.phosphorus.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Potassium (K)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('potassium', { 
                          required: 'Potassium is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 200, message: 'Must be less than 200' }
                        })}
                        className={`input ${errors.potassium ? 'input-error' : ''}`}
                        placeholder="0-200"
                      />
                      {errors.potassium && (
                        <p className="mt-1 text-sm text-red-600">{errors.potassium.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Environmental Conditions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
                    Environmental Conditions
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('temperature', { 
                          required: 'Temperature is required',
                          min: { value: -50, message: 'Must be above -50°C' },
                          max: { value: 60, message: 'Must be below 60°C' }
                        })}
                        className={`input ${errors.temperature ? 'input-error' : ''}`}
                        placeholder="-50 to 60"
                      />
                      {errors.temperature && (
                        <p className="mt-1 text-sm text-red-600">{errors.temperature.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Humidity (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('humidity', { 
                          required: 'Humidity is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 100, message: 'Must be less than 100%' }
                        })}
                        className={`input ${errors.humidity ? 'input-error' : ''}`}
                        placeholder="0-100"
                      />
                      {errors.humidity && (
                        <p className="mt-1 text-sm text-red-600">{errors.humidity.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">pH Level</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('ph', { 
                          required: 'pH is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 14, message: 'Must be less than 14' }
                        })}
                        className={`input ${errors.ph ? 'input-error' : ''}`}
                        placeholder="0-14"
                      />
                      {errors.ph && (
                        <p className="mt-1 text-sm text-red-600">{errors.ph.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Rainfall (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('rainfall', { 
                          required: 'Rainfall is required',
                          min: { value: 0, message: 'Must be positive' },
                          max: { value: 3000, message: 'Must be less than 3000mm' }
                        })}
                        className={`input ${errors.rainfall ? 'input-error' : ''}`}
                        placeholder="0-3000"
                      />
                      {errors.rainfall && (
                        <p className="mt-1 text-sm text-red-600">{errors.rainfall.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Soil Type */}
                <div>
                  <label className="label">Soil Type</label>
                  <select
                    {...register('soilType', { required: 'Soil type is required' })}
                    className={`input ${errors.soilType ? 'input-error' : ''}`}
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.soilType && (
                    <p className="mt-1 text-sm text-red-600">{errors.soilType.message}</p>
                  )}
                </div>

                {/* Location (Optional) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                    Location (Optional)
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        {...register('location.latitude')}
                        className="input"
                        placeholder="e.g., 28.6139"
                      />
                    </div>
                    <div>
                      <label className="label">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        {...register('location.longitude')}
                        className="input"
                        placeholder="e.g., 77.2090"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="label">Address</label>
                    <input
                      type="text"
                      {...register('location.address')}
                      className="input"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="btn-primary flex-1 btn-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Get Prediction
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="btn-secondary btn-lg"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {predictionResult ? (
            <div className="space-y-6">
              {/* Prediction Results */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Prediction Results</h2>
                  <div className="text-sm text-gray-500">
                    Processing time: {predictionResult.processingTime}ms
                  </div>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {predictionResult.predictions?.map((prediction, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prediction.crop}
                          </h3>
                          <div className="flex space-x-2">
                            <span className={`badge ${getConfidenceColor(prediction.confidence)}`}>
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                            <span className={`badge ${getSuitabilityColor(prediction.suitability)}`}>
                              {prediction.suitability}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Why this crop?</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {prediction.reasons?.map((reason, reasonIndex) => (
                              <li key={reasonIndex} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Data */}
              {marketData?.data?.crop && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Market Intelligence
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Current Price</h4>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{marketData.data.crop.marketInfo.currentPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          {marketData.data.crop.marketInfo.currency}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Price Trend</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            marketData.data.crop.marketInfo.trend === 'up' ? 'text-green-600' :
                            marketData.data.crop.marketInfo.trend === 'down' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {marketData.data.crop.marketInfo.trend === 'up' ? '↗️' :
                             marketData.data.crop.marketInfo.trend === 'down' ? '↘️' : '→'}
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {marketData.data.crop.marketInfo.changePercent}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Demand</h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {marketData.data.crop.marketInfo.demand}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Season</h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {marketData.data.crop.marketInfo.season}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {predictionResult.recommendations?.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
                  </div>
                  <div className="card-body">
                    <div className="space-y-3">
                      {predictionResult.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                            rec.priority === 'High' ? 'bg-red-100' :
                            rec.priority === 'Medium' ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}>
                            <span className={`text-xs font-medium ${
                              rec.priority === 'High' ? 'text-red-600' :
                              rec.priority === 'Medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {rec.priority === 'High' ? 'H' : rec.priority === 'Medium' ? 'M' : 'L'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{rec.type}</h4>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for Prediction
                </h3>
                <p className="text-gray-600">
                  Fill in the form on the left to get AI-powered crop recommendations
                  based on your soil and environmental conditions.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Prediction;
