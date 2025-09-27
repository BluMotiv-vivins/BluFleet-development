import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface S3PredictionRecord {
  recordId: string;
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

interface PredictionFilters {
  deviceId?: string;
  healthStage?: string;
  startDate?: Date;
  endDate?: Date;
}

export class S3PredictionsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-west-2'
    });
    this.bucketName = process.env.S3_PREDICTIONS_BUCKET || 'blufleet-predictions-20250826';
  }

  async getPredictions(
    filters: PredictionFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{ predictions: S3PredictionRecord[], total: number }> {
    try {
      // List prediction files in S3
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'predictions/',
        MaxKeys: 100
      });

      const response = await this.s3Client.send(listCommand);
      const files = response.Contents?.filter((obj: any) => obj.Key?.endsWith('.csv')) || [];

      let allPredictions: S3PredictionRecord[] = [];

      console.log(`Found ${files.length} CSV files in S3 bucket`);

      // Read each CSV file (read all files, not just first 5)
      for (const file of files) {
        if (!file.Key) continue;

        console.log(`Reading predictions from ${file.Key}`);
        try {
          const predictions = await this.readPredictionsFromFile(file.Key);
          console.log(`Successfully read ${predictions.length} predictions from ${file.Key}`);
          allPredictions = allPredictions.concat(predictions);
        } catch (error) {
          console.error(`Error reading predictions file ${file.Key}:`, error);
        }
      }

      // Apply filters
      const filteredPredictions = this.applyFilters(allPredictions, filters);

      // Sort by timestamp descending
      filteredPredictions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const total = filteredPredictions.length;
      const paginatedPredictions = filteredPredictions.slice(offset, offset + limit);

      return {
        predictions: paginatedPredictions,
        total
      };
    } catch (error) {
      console.error('Error fetching predictions from S3:', error);
      throw new Error('Failed to fetch predictions from S3');
    }
  }

  private async readPredictionsFromFile(key: string): Promise<S3PredictionRecord[]> {
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    const response = await this.s3Client.send(getCommand);
    
    if (!response.Body) {
      throw new Error(`No body in S3 response for ${key}`);
    }

    return new Promise((resolve, reject) => {
      const predictions: S3PredictionRecord[] = [];
      const stream = response.Body as Readable;

      stream
        .pipe(csv())
        .on('data', (row: any) => {
          try {
            const prediction: S3PredictionRecord = {
              recordId: row.record_id,
              timestamp: row.timestamp,
              deviceId: row.device_id,
              cycle: parseInt(row.cycle) || 0,
              frequency: parseFloat(row.frequency) || 0,
              zReal: parseFloat(row.z_real) || 0,
              zImag: parseFloat(row.z_imag) || 0,
              rrul: parseFloat(row.rrul) || 0,
              rulPrediction: parseFloat(row.rul_prediction) || 0,
              healthStage: row.health_stage || 'unknown',
              kinesisStream: row.kinesis_stream || '',
              sagemakerEndpoint: row.sagemaker_endpoint || '',
              lambdaRequestId: row.lambda_request_id || '',
              rawDataLocation: row.raw_data_location || ''
            };
            predictions.push(prediction);
          } catch (error) {
            console.error('Error parsing CSV row:', error, row);
          }
        })
        .on('end', () => resolve(predictions))
        .on('error', (error: any) => reject(error));
    });
  }

  private applyFilters(predictions: S3PredictionRecord[], filters: PredictionFilters): S3PredictionRecord[] {
    return predictions.filter(prediction => {
      if (filters.deviceId && prediction.deviceId !== filters.deviceId) return false;
      if (filters.healthStage && prediction.healthStage !== filters.healthStage) return false;
      
      if (filters.startDate && new Date(prediction.timestamp) < filters.startDate) return false;
      if (filters.endDate && new Date(prediction.timestamp) > filters.endDate) return false;
      
      return true;
    });
  }

  async getPredictionsSummary(): Promise<any> {
    try {
      const { predictions } = await this.getPredictions({}, 1000, 0);
      
      const summary = {
        total: predictions.length,
        byHealthStage: {} as Record<string, number>,
        byDevice: {} as Record<string, number>,
        avgRulPrediction: 0,
        recentPredictions: predictions.slice(0, 10)
      };

      predictions.forEach(prediction => {
        // Count by health stage
        summary.byHealthStage[prediction.healthStage] = 
          (summary.byHealthStage[prediction.healthStage] || 0) + 1;
        
        // Count by device
        summary.byDevice[prediction.deviceId] = 
          (summary.byDevice[prediction.deviceId] || 0) + 1;
      });

      // Calculate average RUL prediction
      if (predictions.length > 0) {
        summary.avgRulPrediction = predictions.reduce((sum, p) => sum + p.rulPrediction, 0) / predictions.length;
      }

      return summary;
    } catch (error) {
      console.error('Error getting predictions summary:', error);
      throw error;
    }
  }
}
