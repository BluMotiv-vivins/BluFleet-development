import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePredictionsData } from '../hooks/usePredictionsData';
import type { PredictionRecord, PredictionsFilters, PredictionsSummary } from '../hooks/usePredictionsData';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Icon from '../components/ui/Icon';
import { getAuthHeaders } from '../utils/auth';

const FleetPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [summary, setSummary] = useState<PredictionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [awsHealthStatus, setAwsHealthStatus] = useState<{
    s3: 'healthy' | 'warning' | 'error';
    lambda: 'healthy' | 'warning' | 'error';
    iotCore: 'healthy' | 'warning' | 'error';
    kinesis: 'healthy' | 'warning' | 'error';
    lastChecked: string;
  } | null>(null);
  const [filters, setFilters] = useState<PredictionsFilters>({
    dateRange: {
      start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Extended to 14 days to include Sep 17 data
      end: new Date().toISOString().split('T')[0]
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false); // Auto-refresh OFF by default
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket();
  
  // Predictions data hook
  const {
    fetchPredictions,
    fetchPredictionsSummary,
    exportPredictions: exportPredictionsData
  } = usePredictionsData();

  // Load initial data
  useEffect(() => {
    loadPredictions();
    loadSummary();
    checkAWSHealth();
    setLastRefresh(new Date().toLocaleTimeString());
  }, [filters]);

  // Auto-refresh every 30 seconds when real-time is enabled
  useEffect(() => {
    if (!realTimeEnabled) return;
    
    const interval = setInterval(() => {
      loadPredictions();
      loadSummary();
      setLastRefresh(new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, filters]);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPredictions(filters);
      setPredictions(result.data);
    } catch (error) {
      console.error('Error loading predictions:', error);
      // No mock data - show empty state when S3 data is unavailable
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, fetchPredictions]);

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await fetchPredictionsSummary(filters);
      
      // If backend summary has no data but we have predictions, calculate locally
      if (summaryData.totalPredictions === 0 && predictions.length > 0) {
        console.log('Backend summary empty, calculating from predictions data');
        const calculatedSummary = {
          totalPredictions: predictions.length,
          healthyCount: predictions.filter(p => p.healthStage === 'healthy').length,
          warningCount: predictions.filter(p => p.healthStage === 'warning').length,
          criticalCount: predictions.filter(p => p.healthStage === 'critical').length,
          avgRulPrediction: predictions.length > 0 
            ? predictions.reduce((sum, p) => sum + p.rulPrediction, 0) / predictions.length 
            : 0,
          uniqueDevices: [...new Set(predictions.map(p => p.deviceId))].length
        };
        setSummary(calculatedSummary);
      } else {
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      // Calculate from predictions data if backend fails
      if (predictions.length > 0) {
        const calculatedSummary = {
          totalPredictions: predictions.length,
          healthyCount: predictions.filter(p => p.healthStage === 'healthy').length,
          warningCount: predictions.filter(p => p.healthStage === 'warning').length,
          criticalCount: predictions.filter(p => p.healthStage === 'critical').length,
          avgRulPrediction: predictions.length > 0 
            ? predictions.reduce((sum, p) => sum + p.rulPrediction, 0) / predictions.length 
            : 0,
          uniqueDevices: [...new Set(predictions.map(p => p.deviceId))].length
        };
        setSummary(calculatedSummary);
      } else {
        setSummary({
          totalPredictions: 0,
          healthyCount: 0,
          warningCount: 0,
          criticalCount: 0,
          avgRulPrediction: 0,
          uniqueDevices: 0
        });
      }
    }
  }, [filters, fetchPredictionsSummary, predictions]);

  // Recalculate summary when predictions data changes
  useEffect(() => {
    if (predictions.length > 0 && (!summary || summary.totalPredictions === 0)) {
      loadSummary();
    }
  }, [predictions, summary, loadSummary]);

  const checkAWSHealth = useCallback(async () => {
    console.log('🔍 Checking AWS health...');
    try {
      const headers = getAuthHeaders();
      console.log('🔑 Auth headers:', headers);
      
      const response = await fetch('http://localhost:3000/api/analytics/health/aws', {
        method: 'GET',
        headers,
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ AWS health response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AWS health status');
      }
      
      const data = result.data;
      
      // Use the actual AWS health status from backend
      setAwsHealthStatus({
        s3: data.s3 || 'error',
        lambda: data.lambda || 'error',
        iotCore: data.iotCore || 'error',
        kinesis: data.kinesis || 'error',
        lastChecked: data.timestamp || new Date().toISOString()
      });
      
      console.log('✅ AWS health status updated:', {
        s3: data.s3,
        lambda: data.lambda,
        iotCore: data.iotCore,
        kinesis: data.kinesis
      });
    } catch (error) {
      console.error('❌ Error checking AWS health:', error);
      setAwsHealthStatus({
        s3: 'error',
        lambda: 'error',
        iotCore: 'error',
        kinesis: 'error',
        lastChecked: new Date().toISOString()
      });
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportPredictionsData(filters);
    } catch (error) {
      console.error('Error exporting predictions:', error);
    }
  }, [filters, exportPredictionsData]);

  const handleRefresh = useCallback(async () => {
    await loadPredictions();
    await loadSummary();
    await checkAWSHealth();
    setLastRefresh(new Date().toLocaleTimeString());
  }, [loadPredictions, loadSummary, checkAWSHealth]);

  const handleTestIoTConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/test/iot', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        alert('IoT Core test message sent successfully! Check the dashboard in 30-60 seconds for new data.');
      } else {
        alert('Failed to send test message to IoT Core.');
      }
    } catch (error) {
      console.error('Error testing IoT connection:', error);
      alert('Error testing IoT Core connection.');
    }
  }, []);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getHealthStageColor = (stage: string) => {
    switch (stage) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' EST';
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 rounded-xl mx-6 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-6 rounded-xl">
          {/* Row 1: Title */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Fleet Predictions Dashboard</h1>
          </div>
          
          {/* Row 2: Subtitle and Status Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">Real-time AI-powered fleet health insights and predictive analytics</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Last updated: {lastRefresh}</span>
              <span>•</span>
              <span>Data source: S3 (US-East-1)</span>
              <span>•</span>
              <span>Real-time: {realTimeEnabled ? 'Active' : 'Paused'}</span>
            </div>
          </div>
          
          {/* Row 3: Buttons */}
          <div className="flex justify-center gap-2 flex-wrap pb-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <Icon name="search" className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDataExport(true)}
              className="flex items-center gap-2"
            >
              <Icon name="download" className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              variant={realTimeEnabled ? 'primary' : 'outline'}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className="flex items-center gap-2"
            >
              <Icon name="radio" className="w-4 h-4" />
              <span>{realTimeEnabled ? 'Real-Time ON' : 'Real-Time OFF'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleTestIoTConnection}
              className="flex items-center gap-2"
            >
              <Icon name="beaker" className="w-4 h-4" />
              <span>Test IoT</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* AWS Services Health Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AWS Services Health Monitor</h2>
            <Button variant="outline" onClick={checkAWSHealth} className="text-sm">
              <Icon name="refresh" className="w-4 h-4" />
              <span>Check Health</span>
            </Button>
          </div>
          
          {awsHealthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">S3 Storage</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Predictions bucket</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(awsHealthStatus.s3)}`}>
                    {awsHealthStatus.s3}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Lambda Functions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Data processing</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(awsHealthStatus.lambda)}`}>
                    {awsHealthStatus.lambda}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">IoT Core</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Device connectivity</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(awsHealthStatus.iotCore)}`}>
                    {awsHealthStatus.iotCore}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Kinesis Stream</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Data streaming</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(awsHealthStatus.kinesis)}`}>
                    {awsHealthStatus.kinesis}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Real-time Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">WebSocket Connection</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                realTimeEnabled ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Real-time Updates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{realTimeEnabled ? 'Enabled (30s interval)' : 'Disabled'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Pipeline</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">IoT → Kinesis → S3 → Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards - Fixed 3x3 Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Fleet Health Overview</h2>
          {!summary ? (
            <div className="flex flex-col justify-center items-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading fleet health overview...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <Icon name="chart" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Predictions</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalPredictions.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Last 7 days</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 text-green-700 dark:text-green-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Healthy Vehicles</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.healthyCount}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">{((summary.healthyCount / summary.totalPredictions) * 100).toFixed(1)}% of fleet</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-700 rounded-full flex items-center justify-center">
                    <Icon name="alert-triangle" className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warning Status</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{summary.warningCount}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Require attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-200 dark:bg-red-700 rounded-full flex items-center justify-center">
                    <Icon name="alert-circle" className="w-4 h-4 text-red-700 dark:text-red-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Status</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{summary.criticalCount}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Immediate action</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">RUL</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg RUL Score</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(summary.avgRulPrediction)}%</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Remaining useful life</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
                    <Icon name="car" className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Devices</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.uniqueDevices}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Monitored vehicles</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Predictions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Predictions ({predictions.length})
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Real-time vehicle health predictions from ML models
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min(itemsPerPage, predictions.length)} of {predictions.length} records
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading predictions from S3...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few seconds</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <Icon name="chart" className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              <p className="text-xl text-gray-600 dark:text-gray-300">No predictions data available</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your date range or send test data to IoT Core</p>
              <Button onClick={handleTestIoTConnection} variant="primary">
                Send Test Data to IoT Core
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Health Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RUL Prediction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cycle Count
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RRUL Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Impedance (Z)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp (EST)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {predictions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{prediction.deviceId}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">#{prediction.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getHealthStageColor(prediction.healthStage)}`}>
                          {prediction.healthStage.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(prediction.rulPrediction)}%
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                prediction.rulPrediction >= 90 ? 'bg-green-500' :
                                prediction.rulPrediction >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${prediction.rulPrediction}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {prediction.cycle.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatNumber(prediction.rrul, 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="text-xs">
                          <div>Real: {formatNumber(prediction.zReal, 3)}</div>
                          <div>Imag: {formatNumber(prediction.zImag, 3)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(prediction.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {predictions.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, predictions.length)} of {predictions.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.ceil(predictions.length / itemsPerPage) }, (_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === Math.ceil(predictions.length / itemsPerPage) ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded border transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(predictions.length / itemsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(predictions.length / itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Advanced Filters"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {filters.deviceId !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device ID
              </label>
              <input
                type="text"
                value={filters.deviceId || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  deviceId: e.target.value || undefined
                })}
                placeholder="Enter device ID (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {filters.healthStage !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Health Stage
              </label>
              <select
                value={filters.healthStage || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  healthStage: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All stages</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowFilters(false);
                loadPredictions();
                loadSummary();
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* Data Export Modal */}
      <Modal
        isOpen={showDataExport}
        onClose={() => setShowDataExport(false)}
        title="Export & Download Options"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
              <Icon name="chart" className="w-5 h-5" />
              <span>Predictions Data Export</span>
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Export prediction data in various formats for analysis and reporting.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleExport} className="flex items-center justify-center space-x-2">
                <Icon name="download" className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <Icon name="chart" className="w-4 h-4" />
                <span>Export Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <Icon name="download" className="w-4 h-4" />
                <span>Export JSON</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <Icon name="trending" className="w-4 h-4" />
                <span>Export PDF Report</span>
              </Button>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center space-x-2">
              <Icon name="folder" className="w-5 h-5" />
              <span>Historical Data Access</span>
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Download historical prediction data directly from S3 bucket.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Icon name="download" className="w-4 h-4" />
                <span>Download Last 24 Hours</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Icon name="download" className="w-4 h-4" />
                <span>Download Last 7 Days</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Icon name="download" className="w-4 h-4" />
                <span>Download Last 30 Days</span>
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              <Icon name="link" className="w-5 h-5 inline mr-2" />
              API Access
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Programmatic access to prediction data via REST API endpoints.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 p-3">
              <code className="text-xs text-gray-800 dark:text-gray-200">
                GET /api/analytics/predictions?start=2025-01-01&end=2025-01-31
              </code>
            </div>
            <Button variant="outline" className="w-full mt-3 flex items-center justify-center space-x-2">
              <span>📖</span>
              <span>View API Documentation</span>
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowDataExport(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FleetPredictions;
