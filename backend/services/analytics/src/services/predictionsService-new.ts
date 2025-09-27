import { S3DataService } from './s3DataService';
import type { PredictionRecord, S3DataFilters } from './s3DataService';

export interface PredictionsFilters {
  startDate?: string;
  endDate?: string;
  deviceId?: string;
  healthStage?: string;
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

export class PredictionsService {
  private s3DataService: S3DataService;

  constructor() {
    this.s3DataService = new S3DataService();
  }

  async getPredictions(filters: PredictionsFilters): Promise<{
    data: PredictionRecord[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Convert filters to S3DataFilters format
      const s3Filters: S3DataFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        deviceId: filters.deviceId,
        healthStage: filters.healthStage,
        minConfidence: filters.minConfidence,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      };

      return await this.s3DataService.getPredictions(s3Filters);
    } catch (error) {
      console.error('Error in PredictionsService.getPredictions:', error);
      throw error;
    }
  }

  async getLatestPredictions(limit: number = 50): Promise<PredictionRecord[]> {
    try {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const result = await this.s3DataService.getPredictions({
        startDate: threeDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        limit: limit,
        offset: 0
      });
      
      return result.data;
    } catch (error) {
      console.error('Error fetching latest predictions:', error);
      throw error;
    }
  }

  async getPredictionsSummary(filters: PredictionsFilters): Promise<{
    totalPredictions: number;
    healthyCount: number;
    warningCount: number;
    criticalCount: number;
    avgRulPrediction: number;
    uniqueDevices: number;
  }> {
    try {
      return await this.s3DataService.getSummary();
    } catch (error) {
      console.error('Error fetching predictions summary:', error);
      throw error;
    }
  }

  async exportPredictions(filters: PredictionsFilters, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const result = await this.getPredictions({ ...filters, limit: 10000 }); // Get more data for export
      const predictions = result.data;

      if (format === 'json') {
        return JSON.stringify(predictions, null, 2);
      } else {
        // CSV format
        const headers = [
          'Record ID', 'Timestamp', 'Device ID', 'Cycle', 'Frequency',
          'Z Real', 'Z Imag', 'RRUL', 'RUL Prediction', 'Health Stage',
          'Kinesis Stream', 'SageMaker Endpoint', 'Lambda Request ID', 'Raw Data Location'
        ];

        const rows = predictions.map(record => [
          record.record_id,
          record.timestamp,
          record.device_id,
          record.cycle,
          record.frequency,
          record.z_real,
          record.z_imag,
          record.rrul,
          record.rul_prediction,
          record.health_stage,
          record.kinesis_stream,
          record.sagemaker_endpoint,
          record.lambda_request_id,
          record.raw_data_location
        ]);

        const csvContent = [headers, ...rows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        return csvContent;
      }
    } catch (error) {
      console.error('Error exporting predictions:', error);
      throw error;
    }
  }
}

export { PredictionRecord };
