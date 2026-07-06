import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  BarChart3, 
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { marketAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Market = () => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Fetch market data
  const { data: pricesData, isLoading: pricesLoading, refetch: refetchPrices } = useQuery(
    ['marketPrices', selectedCrop],
    () => marketAPI.getPrices({ crop: selectedCrop || undefined }),
    { refetchInterval: 60000 }
  );

  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery(
    ['marketTrends', selectedPeriod],
    () => marketAPI.getTrends({ period: selectedPeriod }),
    { refetchInterval: 300000 }
  );

  const { data: demandData, isLoading: demandLoading, refetch: refetchDemand } = useQuery(
    ['demandForecast', selectedCrop],
    () => marketAPI.getDemandForecast({ crop: selectedCrop || undefined }),
    { refetchInterval: 300000 }
  );

  const { data: weatherData, isLoading: weatherLoading, refetch: refetchWeather } = useQuery(
    'weatherImpact',
    () => marketAPI.getWeatherImpact(),
    { refetchInterval: 600000 }
  );

  const isLoading = pricesLoading || trendsLoading || demandLoading || weatherLoading;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'text-green-600 bg-green-100';
      case 'High': return 'text-blue-600 bg-blue-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Positive': return 'text-green-600 bg-green-100';
      case 'Neutral': return 'text-gray-600 bg-gray-100';
      case 'Negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = () => {
    refetchPrices();
    refetchTrends();
    refetchDemand();
    refetchWeather();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Market Intelligence
          </h1>
          <p className="text-lg text-gray-600">
            Real-time market prices, trends, and demand forecasts
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-secondary mt-4 sm:mt-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="input"
              >
                <option value="">All Crops</option>
                {pricesData?.data?.allCrops && Object.keys(pricesData.data.allCrops).map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Update Data'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Market Prices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Current Market Prices
                </h2>
              </div>
              <div className="card-body">
                {selectedCrop && pricesData?.data?.crop ? (
                  <div className="space-y-6">
                    {/* Selected Crop Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{selectedCrop}</h3>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(pricesData.data.crop.marketInfo.trend)}
                          <span className={`badge ${getTrendColor(pricesData.data.crop.marketInfo.trend)}`}>
                            {pricesData.data.crop.marketInfo.changePercent}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Current Price</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{pricesData.data.crop.marketInfo.currentPrice}
                          </p>
                          <p className="text-sm text-gray-500">
                            {pricesData.data.crop.marketInfo.currency}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Demand</h4>
                          <span className={`badge ${getDemandColor(pricesData.data.crop.marketInfo.demand)}`}>
                            {pricesData.data.crop.marketInfo.demand}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Season</h4>
                          <p className="text-lg font-semibold text-gray-900">
                            {pricesData.data.crop.marketInfo.season}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Trend</h4>
                          <p className="text-lg font-semibold text-gray-900 capitalize">
                            {pricesData.data.crop.marketInfo.trend}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Regional Prices */}
                    {pricesData.data.crop.marketInfo.regions && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Regional Prices</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(pricesData.data.crop.marketInfo.regions).map(([region, data]) => (
                            <div key={region} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{region}</h5>
                                {getTrendIcon(data.trend)}
                              </div>
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{data.price}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">
                                {data.trend} trend
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pricesData?.data?.allCrops && Object.entries(pricesData.data.allCrops).map(([crop, data]) => (
                      <div key={crop} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{crop}</h3>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(data.trend)}
                            <span className={`badge ${getTrendColor(data.trend)}`}>
                              {data.changePercent}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{data.currentPrice}
                            </p>
                            <p className="text-sm text-gray-500">{data.currency}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`badge ${getDemandColor(data.demand)}`}>
                              {data.demand}
                            </span>
                            <button
                              onClick={() => setSelectedCrop(crop)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Market Trends ({selectedPeriod})
                </h2>
              </div>
              <div className="card-body">
                {trendsData?.data?.trends && (
                  <div className="space-y-6">
                    {/* Top Gainers */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Top Gainers
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {trendsData.data.trends.topGainers.map((crop, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{crop.crop}</h4>
                              <span className="text-green-600 font-semibold">+{crop.change}%</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">₹{crop.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Losers */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                        Top Losers
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {trendsData.data.trends.topLosers.map((crop, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{crop.crop}</h4>
                              <span className="text-red-600 font-semibold">{crop.change}%</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">₹{crop.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Sentiment */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Market Sentiment</h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`badge ${
                          trendsData.data.trends.marketSentiment === 'Bullish' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {trendsData.data.trends.marketSentiment}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {trendsData.data.trends.keyFactors.map((factor, index) => (
                            <li key={index} className="flex items-start">
                              <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Demand Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-purple-600" />
                  Demand Forecast
                </h2>
              </div>
              <div className="card-body">
                {selectedCrop && demandData?.data?.crop ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedCrop}</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Current Demand</h4>
                          <span className={`badge ${getDemandColor(demandData.data.crop.currentDemand)}`}>
                            {demandData.data.crop.currentDemand}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">1 Month Forecast</h4>
                          <div className="space-y-1">
                            <span className={`badge ${getDemandColor(demandData.data.crop.forecast['1month'].demand)}`}>
                              {demandData.data.crop.forecast['1month'].demand}
                            </span>
                            <p className="text-xs text-gray-500">
                              {Math.round(demandData.data.crop.forecast['1month'].confidence * 100)}% confidence
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">3 Months Forecast</h4>
                          <div className="space-y-1">
                            <span className={`badge ${getDemandColor(demandData.data.crop.forecast['3months'].demand)}`}>
                              {demandData.data.crop.forecast['3months'].demand}
                            </span>
                            <p className="text-xs text-gray-500">
                              {Math.round(demandData.data.crop.forecast['3months'].confidence * 100)}% confidence
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {demandData.data.crop.factors.map((factor, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {demandData?.data?.allCrops && Object.entries(demandData.data.allCrops).map(([crop, data]) => (
                      <div key={crop} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{crop}</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Current Demand</h4>
                            <span className={`badge ${getDemandColor(data.currentDemand)}`}>
                              {data.currentDemand}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">3 Months Forecast</h4>
                            <span className={`badge ${getDemandColor(data.forecast['3months'].demand)}`}>
                              {data.forecast['3months'].demand}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedCrop(crop)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Full Forecast
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Weather Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-orange-600" />
                  Weather Impact Analysis
                </h2>
              </div>
              <div className="card-body">
                {weatherData?.data?.weatherImpact && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(weatherData.data.weatherImpact).map(([region, data]) => (
                      <div key={region} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{region}</h3>
                          <span className={`badge ${getImpactColor(data.impact)}`}>
                            {data.impact}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Current Weather</h4>
                            <p className="text-sm text-gray-900">{data.currentWeather}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Forecast</h4>
                            <p className="text-sm text-gray-900">{data.forecast}</p>
                          </div>
                          {data.affectedCrops.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Affected Crops</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {data.affectedCrops.map((crop, index) => (
                                  <span key={index} className="badge badge-gray text-xs">
                                    {crop}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Recommendations</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {data.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Market;
