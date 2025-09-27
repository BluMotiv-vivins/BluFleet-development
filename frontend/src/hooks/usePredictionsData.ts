import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/constants';
import { getAuthHeaders } from '../utils/auth';

export interface PredictionRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  cycle: number;
  frequency: number;
  zReal: number;
  zImag: number;
  rrul: number;
  rulPrediction: number;
  healthStage: string;
  kinesisStream: string;
  sagemakerEndpoint: string;
  lambdaRequestId: string;
  rawDataLocation: string;
}

export interface PredictionsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  deviceId?: string;
  healthStage?: string;
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

export interface PredictionsSummary {
  totalPredictions: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  avgRulPrediction: number;
  uniqueDevices: number;
}

interface UsePredictionsDataReturn {
  loading: boolean;
  error: string | null;
  fetchPredictions: (filters: PredictionsFilters) => Promise<{
    data: PredictionRecord[];
    total: number;
    hasMore: boolean;
  }>;
  fetchLatestPredictions: (limit?: number) => Promise<PredictionRecord[]>;
  fetchPredictionsSummary: (filters: PredictionsFilters) => Promise<PredictionsSummary>;
  exportPredictions: (filters: PredictionsFilters) => Promise<void>;
}

export const usePredictionsData = (): UsePredictionsDataReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async (filters: PredictionsFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        limit: (filters.limit || 100).toString(),
        offset: (filters.offset || 0).toString()
      });

      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      if (filters.healthStage) params.append('healthStage', filters.healthStage);
      if (filters.minConfidence) params.append('minConfidence', filters.minConfidence.toString());

      const response = await fetch(`${API_ENDPOINTS.predictions}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle our real S3 API format: {data: [...], total: number, source: "realtime-s3"}
      if (!data.data) {
        throw new Error('No data received from S3');
      }

      return {
        data: data.data,
        total: data.total || data.data.length,
        hasMore: false // S3 data is finite, no pagination needed
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch predictions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestPredictions = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await fetch(`${API_ENDPOINTS.predictions}/latest?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch latest predictions');
      }

      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch latest predictions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPredictionsSummary = useCallback(async (filters: PredictionsFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      });

      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      if (filters.healthStage) params.append('healthStage', filters.healthStage);
      if (filters.minConfidence) params.append('minConfidence', filters.minConfidence.toString());

      const response = await fetch(`${API_ENDPOINTS.predictions}/summary?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle our real S3 summary format: {totalPredictions, healthyCount, warningCount, criticalCount, avgRulPrediction, uniqueDevices}
      return {
        totalPredictions: data.totalPredictions || 0,
        healthyCount: data.healthyCount || 0,
        warningCount: data.warningCount || 0,
        criticalCount: data.criticalCount || 0,
        avgRulPrediction: data.avgRulPrediction || 0,
        uniqueDevices: data.uniqueDevices || 0
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch predictions summary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportPredictions = useCallback(async (filters: PredictionsFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      });

      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      if (filters.healthStage) params.append('healthStage', filters.healthStage);
      if (filters.minConfidence) params.append('minConfidence', filters.minConfidence.toString());

      const response = await fetch(`${API_ENDPOINTS.predictions}/export?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle CSV download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-predictions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to export predictions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPredictions,
    fetchLatestPredictions,
    fetchPredictionsSummary,
    exportPredictions
  };
};
