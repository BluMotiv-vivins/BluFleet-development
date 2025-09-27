import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { getAuthHeaders } from '../utils/auth';

// Battery Analytics Data Interfaces
interface RULData {
  prediction: number;
  health_stage: string;
  cycle: number;
  frequency: number;
}

interface SOCData {
  prediction: number;
  batt_volt: number;
  batt_temp: number;
  batt_curr: number;
}

interface SOHData {
  prediction: number;
  health_status: string;
  is_critical: boolean;
  capacity_ah: number;
}

interface BatteryAnalytics {
  id: string;
  device_id: string;
  timestamp: string;
  rul?: RULData;
  soc?: SOCData;
  soh?: SOHData;
}

interface BatteryAnalyticsSummary {
  totalVehicles: number;
  rul: {
    averagePrediction: number;
    healthDistribution: Record<string, number>;
    criticalVehicles: number;
  };
  soc: {
    averageCharge: number;
    chargeDistribution: Record<string, number>;
    lowBatteryVehicles: number;
  };
  soh: {
    averageHealth: number;
    healthDistribution: Record<string, number>;
    criticalVehicles: number;
  };
  lastUpdated: string;
}

const BatteryAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<BatteryAnalytics[]>([]);
  const [summary, setSummary] = useState<BatteryAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [silentLoading, setSilentLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [selectedView, setSelectedView] = useState<'combined' | 'rul' | 'soc' | 'soh'>('combined');
  const [showDetails, setShowDetails] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Individual model data states
  const [rulData, setRulData] = useState<BatteryAnalytics[]>([]);
  const [socData, setSocData] = useState<BatteryAnalytics[]>([]);
  const [sohData, setSohData] = useState<BatteryAnalytics[]>([]);
  
  // Vehicle-wise analysis states
  const [vehicleAnalysis, setVehicleAnalysis] = useState<Record<string, any>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  
  // Pagination states for each model
  const [rulPage, setRulPage] = useState(1);
  const [socPage, setSocPage] = useState(1);
  const [sohPage, setSohPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Individual total pages for each model
  const [rulTotalPages, setRulTotalPages] = useState(1);
  const [socTotalPages, setSocTotalPages] = useState(1);
  const [sohTotalPages, setSohTotalPages] = useState(1);
  
  const [activeModelTab, setActiveModelTab] = useState<'rul' | 'soc' | 'soh'>('rul');
  
  // Configurable entries per page
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const entriesOptions = [5, 10, 30, 50];
  
  // Caching state
  const [dataCache, setDataCache] = useState<{
    rul: Record<string, any[]>;
    soc: Record<string, any[]>;
    soh: Record<string, any[]>;
  }>({
    rul: {},
    soc: {},
    soh: {}
  });
  
  // Progressive loading state
  const [isDataFresh, setIsDataFresh] = useState<{
    rul: boolean;
    soc: boolean;
    soh: boolean;
  }>({
    rul: false,
    soc: false,
    soh: false
  });

  // Load combined battery analytics data
  const loadAnalyticsData = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    } else {
      setSilentLoading(true);
    }
    setError('');
    try {
      console.log('BatteryAnalytics: Loading analytics data');
      const response = await fetch(`http://localhost:3000/api/battery/analytics?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=50`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('BatteryAnalytics: Received data:', responseData);
      
      setAnalyticsData(responseData.data?.records || []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load battery analytics data');
      console.error('BatteryAnalytics: Error loading data:', err);
    } finally {
      setLoading(false);
      setSilentLoading(false);
    }
  };

  // Load analytics summary
  const loadAnalyticsSummary = async () => {
    try {
      console.log('BatteryAnalytics: Loading summary');
      const response = await fetch(`http://localhost:3000/api/battery/summary?startDate=${dateRange.start}&endDate=${dateRange.end}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('BatteryAnalytics: Received summary:', responseData);
      
      setSummary(responseData.data || null);
    } catch (err) {
      console.error('BatteryAnalytics: Error loading summary:', err);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      loadAnalyticsData(true); // Silent auto-refresh
      loadAnalyticsSummary();
      loadVehicleAnalysis();
      handleModelTabChange(activeModelTab); // Refresh current tab silently
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, dateRange, activeModelTab, entriesPerPage]);

  // Initial load
  useEffect(() => {
    loadAnalyticsData();
    loadAnalyticsSummary();
    loadVehicleAnalysis();
    handleModelTabChange(activeModelTab);
  }, [dateRange, entriesPerPage]);

  // Load individual model data on component mount
  useEffect(() => {
    handleModelTabChange('rul');
  }, []);

  // Load individual model data with caching
  const loadRULData = async (page: number = 1) => {
    const cacheKey = `${dateRange.start}-${dateRange.end}-${page}-${entriesPerPage}`;
    
    // Check cache first and show cached data immediately
    if (dataCache.rul[cacheKey]) {
      setRulData(dataCache.rul[cacheKey]);
      setRulPage(page);
      setIsDataFresh(prev => ({ ...prev, rul: true }));
    }
    
    setSilentLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/battery/rul?startDate=${dateRange.start}&endDate=${dateRange.end}&page=${page}&limit=${entriesPerPage}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      
      // Transform the data to ensure proper structure
      const transformedData = (responseData.data?.records || []).map((record: any) => ({
        id: record.id || `rul-${record.device_id}-${Date.now()}`,
        device_id: record.device_id,
        timestamp: record.timestamp,
        rul: record.rul || {
          prediction: record.rul_prediction || 0,
          health_stage: record.health_stage || 'Unknown',
          cycle: record.cycle || 0,
          frequency: record.frequency || 0
        }
      }))
      // Sort by timestamp descending (most recent first)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        rul: { ...prev.rul, [cacheKey]: transformedData }
      }));
      
      setRulData(transformedData);
      // Use the total from API response, not the length of current page
      const totalRecords = responseData.data?.total || responseData.data?.pagination?.total || transformedData.length;
      setRulTotalPages(Math.ceil(totalRecords / entriesPerPage));
      setRulPage(page);
      setIsDataFresh(prev => ({ ...prev, rul: true }));
    } catch (err) {
      console.error('Error loading RUL data:', err);
    } finally {
      setSilentLoading(false);
    }
  };

  const loadSOCData = async (page: number = 1) => {
    const cacheKey = `${dateRange.start}-${dateRange.end}-${page}-${entriesPerPage}`;
    
    // Check cache first and show cached data immediately
    if (dataCache.soc[cacheKey]) {
      setSocData(dataCache.soc[cacheKey]);
      setSocPage(page);
      setIsDataFresh(prev => ({ ...prev, soc: true }));
    }
    
    setSilentLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/battery/soc?startDate=${dateRange.start}&endDate=${dateRange.end}&page=${page}&limit=${entriesPerPage}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      
      // Transform the data to ensure proper structure
      const transformedData = (responseData.data?.records || []).map((record: any) => ({
        id: record.id || `soc-${record.device_id}-${Date.now()}`,
        device_id: record.device_id,
        timestamp: record.timestamp,
        soc: record.soc || {
          prediction: record.predicted_soc || 0,
          batt_volt: record.batt_volt || 0,
          batt_temp: record.batt_temp || 0,
          batt_curr: record.batt_curr || 0
        }
      }))
      // Sort by timestamp descending (most recent first)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        soc: { ...prev.soc, [cacheKey]: transformedData }
      }));
      
      setSocData(transformedData);
      // Use the total from API response, not the length of current page
      const totalRecords = responseData.data?.total || responseData.data?.pagination?.total || transformedData.length;
      setSocTotalPages(Math.ceil(totalRecords / entriesPerPage));
      setSocPage(page);
      setIsDataFresh(prev => ({ ...prev, soc: true }));
    } catch (err) {
      console.error('Error loading SOC data:', err);
    } finally {
      setSilentLoading(false);
    }
  };

  const loadSOHData = async (page: number = 1) => {
    const cacheKey = `${dateRange.start}-${dateRange.end}-${page}-${entriesPerPage}`;
    
    // Check cache first and show cached data immediately
    if (dataCache.soh[cacheKey]) {
      setSohData(dataCache.soh[cacheKey]);
      setSohPage(page);
      setIsDataFresh(prev => ({ ...prev, soh: true }));
    }
    
    setSilentLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/battery/soh?startDate=${dateRange.start}&endDate=${dateRange.end}&page=${page}&limit=${entriesPerPage}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      
      // Transform the data to ensure proper structure
      const transformedData = (responseData.data?.records || []).map((record: any) => ({
        id: record.id || `soh-${record.device_id}-${Date.now()}`,
        device_id: record.device_id,
        timestamp: record.timestamp,
        soh: record.soh || {
          prediction: record.predicted_soh || 0,
          health_status: record.health_status || 'Unknown',
          is_critical: record.is_critical || false,
          capacity_ah: record.capacity_ah || 0,
          internal_resistance_ohm: record.internal_resistance_ohm || 0
        }
      }))
      // Sort by timestamp descending (most recent first)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        soh: { ...prev.soh, [cacheKey]: transformedData }
      }));
      
      setSohData(transformedData);
      // Use the total from API response, not the length of current page
      const totalRecords = responseData.data?.total || responseData.data?.pagination?.total || transformedData.length;
      setSohTotalPages(Math.ceil(totalRecords / entriesPerPage));
      setSohPage(page);
      setIsDataFresh(prev => ({ ...prev, soh: true }));
    } catch (err) {
      console.error('Error loading SOH data:', err);
    } finally {
      setSilentLoading(false);
    }
  };

  // Load vehicle-wise analysis
  const loadVehicleAnalysis = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/battery/analytics?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=100`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const records = responseData.data?.records || [];
      
      // Group by device_id for vehicle-wise analysis
      const vehicleGroups = records.reduce((acc: any, record: any) => {
        if (!acc[record.device_id]) {
          acc[record.device_id] = {
            device_id: record.device_id,
            rul_records: [],
            soc_records: [],
            soh_records: [],
            latest_timestamp: record.timestamp
          };
        }
        if (record.rul) acc[record.device_id].rul_records.push(record);
        if (record.soc) acc[record.device_id].soc_records.push(record);
        if (record.soh) acc[record.device_id].soh_records.push(record);
        if (record.timestamp > acc[record.device_id].latest_timestamp) {
          acc[record.device_id].latest_timestamp = record.timestamp;
        }
        return acc;
      }, {});
      
      setVehicleAnalysis(vehicleGroups);
    } catch (err) {
      console.error('Error loading vehicle analysis:', err);
    }
  };

  // Handle model tab change and load corresponding data
  const handleModelTabChange = (model: 'rul' | 'soc' | 'soh') => {
    setActiveModelTab(model);
    setCurrentPage(1);
    
    switch (model) {
      case 'rul':
        loadRULData(1);
        break;
      case 'soc':
        loadSOCData(1);
        break;
      case 'soh':
        loadSOHData(1);
        break;
    }
  };

  // Handle pagination for different models
  const handlePageChange = (page: number) => {
    switch (activeModelTab) {
      case 'rul':
        setRulPage(page);
        loadRULData(page);
        break;
      case 'soc':
        setSocPage(page);
        loadSOCData(page);
        break;
      case 'soh':
        setSohPage(page);
        loadSOHData(page);
        break;
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData(true); // Silent refresh
    loadAnalyticsSummary();
    loadVehicleAnalysis();
    handleModelTabChange(activeModelTab); // Refresh current tab data
  };

  // Helper function to get health color
  const getHealthColor = (stage: string, type: 'rul' | 'soc' | 'soh'): string => {
    switch (type) {
      case 'rul':
        if (stage.toLowerCase().includes('critical')) return 'text-red-600 bg-red-100';
        if (stage.toLowerCase().includes('aging')) return 'text-orange-600 bg-orange-100';
        if (stage.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      case 'soc':
        const soc = parseFloat(stage);
        if (soc < 20) return 'text-red-600 bg-red-100';
        if (soc < 50) return 'text-orange-600 bg-orange-100';
        if (soc < 80) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      case 'soh':
        if (stage.toLowerCase().includes('critical')) return 'text-red-600 bg-red-100';
        if (stage.toLowerCase().includes('aging')) return 'text-orange-600 bg-orange-100';
        if (stage.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 rounded-xl mx-6 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-6 rounded-xl">
          {/* Row 1: Title */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">⚡ Battery Analytics</h1>
          </div>
          
          {/* Row 2: Subtitle and Status Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Real-time battery health monitoring with RUL, SOC, and SOH predictions from ML models
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Last updated: {lastRefresh}</span>
              <span>•</span>
              <span>Data sources: S3 (RUL/SOC/SOH)</span>
              <span>•</span>
              <span>Real-time: {realTimeEnabled ? 'Active' : 'Paused'}</span>
            </div>
          </div>
          
          {/* Row 3: Controls */}
          <div className="flex justify-center gap-2 flex-wrap">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as 'combined' | 'rul' | 'soc' | 'soh')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="combined">All Models</option>
              <option value="rul">RUL Only</option>
              <option value="soc">SOC Only</option>
              <option value="soh">SOH Only</option>
            </select>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setEntriesPerPage(newSize);
                // Clear cache when changing entries per page
                setDataCache({ rul: {}, soc: {}, soh: {} });
                setIsDataFresh({ rul: false, soc: false, soh: false });
                // Reload current data with new page size
                handleModelTabChange(activeModelTab);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {entriesOptions.map(option => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              disabled={silentLoading}
              size="sm"
            >
              <Icon name="refresh" className={`w-4 h-4 ${silentLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </Button>
            <Button
              variant={realTimeEnabled ? 'primary' : 'outline'}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className="flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              <Icon name="radio" className="w-4 h-4" />
              <span className="text-sm">{realTimeEnabled ? 'RT ON' : 'RT OFF'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              <Icon name="chart" className="w-4 h-4" />
              <span className="text-sm">{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Initial Loading State - Only show on first load */}
        {loading && !summary && !analyticsData.length && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon name="refresh" className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">Loading Battery Analytics...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Fetching RUL, SOC, and SOH data from S3</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex">
              <Icon name="warning" className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Battery Analytics</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards Grid */}
        {summary && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalVehicles || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-2xl">🚗</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active fleet vehicles</p>
            </div>

            {/* Average RUL */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg RUL</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {summary.rul?.averagePrediction?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Icon name="clock" className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Remaining cycles</p>
            </div>

            {/* Average SOC */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg SOC</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {summary.soc?.averageCharge?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <span className="text-2xl">🔋</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Battery charge level</p>
            </div>

            {/* Average SOH */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg SOH</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {summary.soh?.averageHealth?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Icon name="heart" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Battery health</p>
            </div>
          </div>
        )}

        {/* Model-specific Analytics */}
        {summary && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RUL Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Icon name="clock" className="w-5 h-5 mr-2 text-green-600" />
                Remaining Useful Life (RUL)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Prediction</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {summary.rul?.averagePrediction?.toFixed(1) || '0'} cycles
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Critical Vehicles</span>
                  <span className="text-sm font-medium text-red-600">{summary.rul?.criticalVehicles || 0}</span>
                </div>
                {Object.entries(summary.rul?.healthDistribution || {}).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stage}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 dark:bg-green-400 h-2 rounded-full" 
                          style={{ width: `${(count / (summary.totalVehicles || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOC Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔋</span>
                State of Charge (SOC)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Charge</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {summary.soc?.averageCharge?.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Low Battery Vehicles</span>
                  <span className="text-sm font-medium text-orange-600">{summary.soc?.lowBatteryVehicles || 0}</span>
                </div>
                {Object.entries(summary.soc?.chargeDistribution || {}).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{level}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${(count / (summary.totalVehicles || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOH Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Icon name="heart" className="w-5 h-5 mr-2 text-purple-600" />
                State of Health (SOH)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Health</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {summary.soh?.averageHealth?.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Critical Vehicles</span>
                  <span className="text-sm font-medium text-red-600">{summary.soh?.criticalVehicles || 0}</span>
                </div>
                {Object.entries(summary.soh?.healthDistribution || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full" 
                          style={{ width: `${(count / (summary.totalVehicles || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Table */}
        {showDetails && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Battery Analytics Data ({analyticsData.length} vehicles)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">RUL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SOC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SOH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Update</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analyticsData.slice(0, 20).map((record, index) => (
                    <tr key={`${record.device_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {record.device_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.rul && record.rul.prediction !== undefined ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{record.rul.prediction.toFixed(1)} cycles</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getHealthColor(record.rul.health_stage, 'rul')}`}>
                              {record.rul.health_stage}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No RUL data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.soc && record.soc.prediction !== undefined ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{record.soc.prediction.toFixed(1)}%</span>
                            <span className="text-xs text-gray-400">{record.soc?.batt_volt?.toFixed(1) || 'N/A'}V</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No SOC data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.soh && record.soh.prediction !== undefined ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{record.soh.prediction.toFixed(1)}%</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getHealthColor(record.soh.health_status, 'soh')}`}>
                              {record.soh.health_status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No SOH data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {analyticsData.length > 20 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center">
                Showing first 20 of {analyticsData.length} vehicles
              </div>
            )}
          </div>
        )}

        {/* Individual Model Data Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Model-Specific Analytics</h3>
            
            {/* Model Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'rul', label: 'RUL Model', icon: '', color: 'green' },
                { key: 'soc', label: 'SOC Model', icon: '', color: 'yellow' },
                { key: 'soh', label: 'SOH Model', icon: '', color: 'purple' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleModelTabChange(tab.key as 'rul' | 'soc' | 'soh')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeModelTab === tab.key
                      ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30 text-${tab.color}-700 dark:text-${tab.color}-300`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Data Content */}
          <div className="p-6">
            {/* RUL Data */}
            {activeModelTab === 'rul' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Remaining Useful Life Predictions
                    </h4>
                    {silentLoading && isDataFresh.rul && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {rulData.length} entries (Page {rulPage} of {rulTotalPages})
                  </span>
                </div>
                <div className="grid gap-3">
                  {rulData.map((record, index) => (
                    <div key={`rul-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Vehicle: {record.device_id}
                            </span>
                            {record.rul && (
                              <span className={`px-2 py-1 text-xs rounded-full ${getHealthColor(record.rul.health_stage, 'rul')}`}>
                                {record.rul.health_stage}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Prediction:</span>
                              <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                                {record.rul?.prediction?.toFixed(1) || 'N/A'} cycles
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Current Cycle:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                {record.rul?.cycle || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                {record.rul?.frequency || 'N/A'} Hz
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* RUL Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, rulPage - 1);
                        setRulPage(newPage);
                        loadRULData(newPage);
                      }}
                      disabled={rulPage <= 1 || silentLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {rulPage} of {rulTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = rulPage + 1;
                        setRulPage(newPage);
                        loadRULData(newPage);
                      }}
                      disabled={rulPage >= rulTotalPages || silentLoading}
                    >
                      Next
                    </Button>
                  </div>
                  {silentLoading && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Icon name="refresh" className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOC Data */}
            {activeModelTab === 'soc' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      State of Charge Predictions
                    </h4>
                    {silentLoading && isDataFresh.soc && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {socData.length} entries (Page {socPage} of {socTotalPages})
                  </span>
                </div>
                <div className="grid gap-3">
                  {socData.map((record, index) => (
                    <div key={`soc-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Vehicle: {record.device_id}
                            </span>
                            {record.soc?.prediction !== undefined && (
                              <span className={`px-2 py-1 text-xs rounded-full ${getHealthColor(record.soc.prediction.toString(), 'soc')}`}>
                                {record.soc.prediction.toFixed(1)}% Charge
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Voltage:</span>
                              <span className="ml-1 font-medium text-yellow-600 dark:text-yellow-400">
                                {record.soc?.batt_volt?.toFixed(2) || 'N/A'}V
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                {record.soc?.batt_temp?.toFixed(1) || 'N/A'}°C
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Current:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                {record.soc?.batt_curr?.toFixed(2) || 'N/A'}A
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* SOC Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, socPage - 1);
                        setSocPage(newPage);
                        loadSOCData(newPage);
                      }}
                      disabled={socPage <= 1 || silentLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {socPage} of {socTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = socPage + 1;
                        setSocPage(newPage);
                        loadSOCData(newPage);
                      }}
                      disabled={socPage >= socTotalPages || silentLoading}
                    >
                      Next
                    </Button>
                  </div>
                  {silentLoading && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Icon name="refresh" className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOH Data */}
            {activeModelTab === 'soh' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      State of Health Predictions
                    </h4>
                    {silentLoading && isDataFresh.soh && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sohData.length} entries (Page {sohPage} of {sohTotalPages})
                  </span>
                </div>
                <div className="grid gap-3">
                  {sohData.map((record, index) => (
                    <div key={`soh-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Vehicle: {record.device_id}
                            </span>
                            {record.soh && (
                              <span className={`px-2 py-1 text-xs rounded-full ${getHealthColor(record.soh.health_status, 'soh')}`}>
                                {record.soh.health_status}
                              </span>
                            )}
                            {record.soh?.is_critical && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                Critical
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Health:</span>
                              <span className="ml-1 font-medium text-purple-600 dark:text-purple-400">
                                {record.soh?.prediction?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                {record.soh?.capacity_ah?.toFixed(1) || 'N/A'}Ah
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* SOH Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, sohPage - 1);
                        setSohPage(newPage);
                        loadSOHData(newPage);
                      }}
                      disabled={sohPage <= 1 || silentLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {sohPage} of {sohTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = sohPage + 1;
                        setSohPage(newPage);
                        loadSOHData(newPage);
                      }}
                      disabled={sohPage >= sohTotalPages || silentLoading}
                    >
                      Next
                    </Button>
                  </div>
                  {silentLoading && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Icon name="refresh" className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remove old pagination - it will be replaced with model-specific pagination above */}
            {false && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <Icon name="chevron-left" className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <Icon name="chevron-right" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle-wise Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle-wise Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive battery health analysis per vehicle
            </p>
          </div>
          
          <div className="p-6">
            {/* Vehicle Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Vehicle for Detailed Analysis
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Vehicles Overview</option>
                {Object.keys(vehicleAnalysis).map((deviceId) => (
                  <option key={deviceId} value={deviceId}>
                    Vehicle {deviceId}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Cards Grid */}
            {!selectedVehicle ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(vehicleAnalysis).slice(0, 9).map(([deviceId, vehicle]) => (
                  <div key={deviceId} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedVehicle(deviceId)}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Vehicle {deviceId}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(vehicle.latest_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* RUL Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">RUL:</span>
                        <div className="flex items-center space-x-2">
                          {vehicle.rul_records.length > 0 ? (
                            <>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {vehicle.rul_records[0]?.rul?.prediction?.toFixed(1) || 'N/A'} cycles
                              </span>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>
                      
                      {/* SOC Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">SOC:</span>
                        <div className="flex items-center space-x-2">
                          {vehicle.soc_records.length > 0 ? (
                            <>
                              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                {vehicle.soc_records[0]?.soc?.prediction?.toFixed(1) || 'N/A'}%
                              </span>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>
                      
                      {/* SOH Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">SOH:</span>
                        <div className="flex items-center space-x-2">
                          {vehicle.soh_records.length > 0 ? (
                            <>
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {vehicle.soh_records[0]?.soh?.prediction?.toFixed(1) || 'N/A'}%
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                vehicle.soh_records[0]?.soh?.is_critical ? 'bg-red-500' : 'bg-purple-500'
                              }`}></div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Records: {vehicle.rul_records.length + vehicle.soc_records.length + vehicle.soh_records.length}</span>
                        <span>→ View Details</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Selected Vehicle Detailed View */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Vehicle {selectedVehicle} - Detailed Analysis
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVehicle('')}
                  >
                    ← Back to Overview
                  </Button>
                </div>
                
                {vehicleAnalysis[selectedVehicle] && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* RUL Analysis */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
                        <Icon name="clock" className="w-4 h-4 mr-2" />
                        RUL Analysis ({vehicleAnalysis[selectedVehicle].rul_records.length} records)
                      </h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehicleAnalysis[selectedVehicle].rul_records.slice(0, 5).map((record: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{record.rul?.prediction?.toFixed(1) || 'N/A'} cycles</span>
                              <span className="text-xs text-gray-500">
                                {new Date(record.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Stage: {record.rul?.health_stage || 'Unknown'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* SOC Analysis */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
                        🔋 SOC Analysis ({vehicleAnalysis[selectedVehicle].soc_records.length} records)
                      </h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehicleAnalysis[selectedVehicle].soc_records.slice(0, 5).map((record: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{record.soc?.prediction?.toFixed(1) || 'N/A'}%</span>
                              <span className="text-xs text-gray-500">
                                {new Date(record.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Voltage: {record.soc?.batt_volt?.toFixed(2) || 'N/A'}V
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* SOH Analysis */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-3 flex items-center">
                        <Icon name="heart" className="w-4 h-4 mr-2" />
                        SOH Analysis ({vehicleAnalysis[selectedVehicle].soh_records.length} records)
                      </h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehicleAnalysis[selectedVehicle].soh_records.slice(0, 5).map((record: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{record.soh?.prediction?.toFixed(1) || 'N/A'}%</span>
                              <span className="text-xs text-gray-500">
                                {new Date(record.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-between">
                              <span>Status: {record.soh?.health_status || 'Unknown'}</span>
                              {record.soh?.is_critical && (
                                <span className="text-red-600 dark:text-red-400">⚠️ Critical</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">ML Model Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !error ? 'bg-green-500 animate-pulse' : 'bg-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">RUL Model</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  S3: blufleet-predictions-20250826
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !error ? 'bg-yellow-500 animate-pulse' : 'bg-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">SOC Model</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  S3: blufleet-soc
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !error ? 'bg-purple-500 animate-pulse' : 'bg-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">SOH Model</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  S3: blufleet-soh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryAnalytics;
