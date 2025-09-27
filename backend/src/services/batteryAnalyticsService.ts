import AWS from 'aws-sdk';
import csv from 'csv-parser';
import { Readable } from 'stream';

// RUL Model interfaces
export interface RULRecord {
  record_id: string;
  timestamp: string;
  device_id: string;
  cycle: number;
  frequency: number;
  z_real: number;
  z_imag: number;
  rrul: number;
  rul_prediction: number;
  health_stage: string;
}

// SOC Model interfaces  
export interface SOCRecord {
  record_id: string;
  timestamp: string;
  device_id: string;
  batt_curr: number;
  batt_volt: number;
  batt_temp: number;
  batt_pwr: number;
  batt_pwr_loss: number;
  predicted_soc: number;
}

// SOH Model interfaces
export interface SOHRecord {
  record_id: string;
  timestamp: string;
  device_id: string;
  capacity_ah: number;
  internal_resistance_ohm: number;
  discharge_voltage_v: number;
  predicted_soh: number;
  health_status: string;
  is_critical: boolean;
}

// Combined battery analytics data
export interface BatteryAnalytics {
  device_id: string;
  timestamp: string;
  rul?: {
    prediction: number;
    health_stage: string;
    cycle: number;
    frequency: number;
  };
  soc?: {
    prediction: number;
    batt_volt: number;
    batt_temp: number;
    batt_curr: number;
  };
  soh?: {
    prediction: number;
    health_status: string;
    is_critical: boolean;
    capacity_ah: number;
  };
}

export interface BatteryAnalyticsSummary {
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

export class BatteryAnalyticsService {
  private s3: AWS.S3;
  private buckets = {
    rul: 'blufleet-predictions-20250826',
    soc: 'blufleet-soc', 
    soh: 'blufleet-soh'
  };

  constructor() {
    const region = 'us-east-1';
    AWS.config.update({ region });
    this.s3 = new AWS.S3();
  }

  // Get S3 path for predictions based on date
  private getS3PathForDate(date: Date, modelType: 'rul' | 'soc' | 'soh'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let fileName: string;
    switch (modelType) {
      case 'rul':
        fileName = `predictions_${year}${month}${day}.csv`;
        break;
      case 'soc':
        fileName = `soc_predictions_${year}${month}${day}.csv`;
        break;
      case 'soh':
        fileName = `soh_predictions_${year}${month}${day}.csv`;
        break;
    }
    
    return `predictions/year=${year}/month=${month}/day=${day}/${fileName}`;
  }

  // Get available prediction files for a date range
  async getAvailableFiles(
    startDate: Date, 
    endDate: Date, 
    modelType: 'rul' | 'soc' | 'soh'
  ): Promise<string[]> {
    const files: string[] = [];
    const currentDate = new Date(startDate);
    const bucketName = this.buckets[modelType];
    
    while (currentDate <= endDate) {
      try {
        const filePath = this.getS3PathForDate(currentDate, modelType);
        
        // Check if file exists
        await this.s3.headObject({
          Bucket: bucketName,
          Key: filePath
        }).promise();
        
        files.push(filePath);
        console.log(`BatteryAnalyticsService: Found ${modelType} file for ${currentDate.toDateString()}`);
      } catch (error) {
        console.log(`BatteryAnalyticsService: No ${modelType} file for ${currentDate.toDateString()}`);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return files;
  }

  // Read RUL predictions from S3
  async readRULPredictions(filePath: string): Promise<RULRecord[]> {
    try {
      console.log(`BatteryAnalyticsService: Reading RUL predictions from ${filePath}`);
      const response = await this.s3.getObject({
        Bucket: this.buckets.rul,
        Key: filePath
      }).promise();

      if (!response.Body) {
        throw new Error('No RUL data found in S3 object');
      }

      const csvData = response.Body.toString();
      const records: RULRecord[] = [];

      return new Promise((resolve, reject) => {
        const stream = Readable.from(csvData);
        
        stream
          .pipe(csv())
          .on('data', (row) => {
            try {
              const record: RULRecord = {
                record_id: row.record_id || '',
                timestamp: row.timestamp || '',
                device_id: row.device_id || '',
                cycle: parseFloat(row.cycle) || 0,
                frequency: parseFloat(row.frequency) || 0,
                z_real: parseFloat(row.z_real) || 0,
                z_imag: parseFloat(row.z_imag) || 0,
                rrul: parseFloat(row.rrul) || 0,
                rul_prediction: parseFloat(row.rul_prediction) || 0,
                health_stage: row.health_stage || 'unknown'
              };
              records.push(record);
            } catch (error) {
              console.warn('BatteryAnalyticsService: Error parsing RUL CSV row:', error);
            }
          })
          .on('end', () => {
            console.log(`BatteryAnalyticsService: Parsed ${records.length} RUL records`);
            resolve(records);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error(`BatteryAnalyticsService: Error reading RUL CSV from S3 ${filePath}:`, error);
      throw error;
    }
  }

  // Read SOC predictions from S3
  async readSOCPredictions(filePath: string): Promise<SOCRecord[]> {
    try {
      console.log(`BatteryAnalyticsService: Reading SOC predictions from ${filePath}`);
      const response = await this.s3.getObject({
        Bucket: this.buckets.soc,
        Key: filePath
      }).promise();

      if (!response.Body) {
        throw new Error('No SOC data found in S3 object');
      }

      const csvData = response.Body.toString();
      const records: SOCRecord[] = [];

      return new Promise((resolve, reject) => {
        const stream = Readable.from(csvData);
        
        stream
          .pipe(csv())
          .on('data', (row) => {
            try {
              const record: SOCRecord = {
                record_id: row.record_id || '',
                timestamp: row.timestamp || '',
                device_id: row.device_id || '',
                batt_curr: parseFloat(row.batt_curr) || 0,
                batt_volt: parseFloat(row.batt_volt) || 0,
                batt_temp: parseFloat(row.batt_temp) || 0,
                batt_pwr: parseFloat(row.batt_pwr) || 0,
                batt_pwr_loss: parseFloat(row.batt_pwr_loss) || 0,
                predicted_soc: parseFloat(row.predicted_soc) || 0
              };
              records.push(record);
            } catch (error) {
              console.warn('BatteryAnalyticsService: Error parsing SOC CSV row:', error);
            }
          })
          .on('end', () => {
            console.log(`BatteryAnalyticsService: Parsed ${records.length} SOC records`);
            resolve(records);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error(`BatteryAnalyticsService: Error reading SOC CSV from S3 ${filePath}:`, error);
      throw error;
    }
  }

  // Read SOH predictions from S3
  async readSOHPredictions(filePath: string): Promise<SOHRecord[]> {
    try {
      console.log(`BatteryAnalyticsService: Reading SOH predictions from ${filePath}`);
      const response = await this.s3.getObject({
        Bucket: this.buckets.soh,
        Key: filePath
      }).promise();

      if (!response.Body) {
        throw new Error('No SOH data found in S3 object');
      }

      const csvData = response.Body.toString();
      const records: SOHRecord[] = [];

      return new Promise((resolve, reject) => {
        const stream = Readable.from(csvData);
        
        stream
          .pipe(csv())
          .on('data', (row) => {
            try {
              const record: SOHRecord = {
                record_id: row.record_id || '',
                timestamp: row.timestamp || '',
                device_id: row.device_id || '',
                capacity_ah: parseFloat(row.capacity_ah) || 0,
                internal_resistance_ohm: parseFloat(row.internal_resistance_ohm) || 0,
                discharge_voltage_v: parseFloat(row.discharge_voltage_v) || 0,
                predicted_soh: parseFloat(row.predicted_soh) || 0,
                health_status: row.health_status || 'unknown',
                is_critical: row.is_critical === 'True' || row.is_critical === 'true'
              };
              records.push(record);
            } catch (error) {
              console.warn('BatteryAnalyticsService: Error parsing SOH CSV row:', error);
            }
          })
          .on('end', () => {
            console.log(`BatteryAnalyticsService: Parsed ${records.length} SOH records`);
            resolve(records);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error(`BatteryAnalyticsService: Error reading SOH CSV from S3 ${filePath}:`, error);
      throw error;
    }
  }

  // Get combined battery analytics for date range
  async getCombinedAnalytics(
    startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: Date = new Date()
  ): Promise<BatteryAnalytics[]> {
    try {
      console.log(`BatteryAnalyticsService: Getting combined analytics from ${startDate.toDateString()} to ${endDate.toDateString()}`);
      
      // Get data from all three models
      const [rulFiles, socFiles, sohFiles] = await Promise.all([
        this.getAvailableFiles(startDate, endDate, 'rul'),
        this.getAvailableFiles(startDate, endDate, 'soc'),
        this.getAvailableFiles(startDate, endDate, 'soh')
      ]);

      // Read all data
      const [rulData, socData, sohData] = await Promise.all([
        Promise.all(rulFiles.map(file => this.readRULPredictions(file))).then(arrays => arrays.flat()),
        Promise.all(socFiles.map(file => this.readSOCPredictions(file))).then(arrays => arrays.flat()),
        Promise.all(sohFiles.map(file => this.readSOHPredictions(file))).then(arrays => arrays.flat())
      ]);

      console.log(`BatteryAnalyticsService: Retrieved ${rulData.length} RUL, ${socData.length} SOC, ${sohData.length} SOH records`);

      // Group data by device_id and combine
      const deviceMap = new Map<string, BatteryAnalytics>();

      // Add RUL data
      rulData.forEach(record => {
        const deviceId = record.device_id;
        if (!deviceMap.has(deviceId)) {
          deviceMap.set(deviceId, {
            device_id: deviceId,
            timestamp: record.timestamp
          });
        }
        const analytics = deviceMap.get(deviceId)!;
        analytics.rul = {
          prediction: record.rul_prediction,
          health_stage: record.health_stage,
          cycle: record.cycle,
          frequency: record.frequency
        };
        // Update to latest timestamp
        if (new Date(record.timestamp) > new Date(analytics.timestamp)) {
          analytics.timestamp = record.timestamp;
        }
      });

      // Add SOC data
      socData.forEach(record => {
        const deviceId = record.device_id;
        if (!deviceMap.has(deviceId)) {
          deviceMap.set(deviceId, {
            device_id: deviceId,
            timestamp: record.timestamp
          });
        }
        const analytics = deviceMap.get(deviceId)!;
        analytics.soc = {
          prediction: record.predicted_soc,
          batt_volt: record.batt_volt,
          batt_temp: record.batt_temp,
          batt_curr: record.batt_curr
        };
        // Update to latest timestamp
        if (new Date(record.timestamp) > new Date(analytics.timestamp)) {
          analytics.timestamp = record.timestamp;
        }
      });

      // Add SOH data
      sohData.forEach(record => {
        const deviceId = record.device_id;
        if (!deviceMap.has(deviceId)) {
          deviceMap.set(deviceId, {
            device_id: deviceId,
            timestamp: record.timestamp
          });
        }
        const analytics = deviceMap.get(deviceId)!;
        analytics.soh = {
          prediction: record.predicted_soh,
          health_status: record.health_status,
          is_critical: record.is_critical,
          capacity_ah: record.capacity_ah
        };
        // Update to latest timestamp
        if (new Date(record.timestamp) > new Date(analytics.timestamp)) {
          analytics.timestamp = record.timestamp;
        }
      });

      const combinedAnalytics = Array.from(deviceMap.values());
      console.log(`BatteryAnalyticsService: Combined analytics for ${combinedAnalytics.length} vehicles`);
      
      return combinedAnalytics;
    } catch (error) {
      console.error('BatteryAnalyticsService: Error getting combined analytics:', error);
      throw error;
    }
  }

  // Calculate summary statistics
  async getBatteryAnalyticsSummary(
    startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: Date = new Date()
  ): Promise<BatteryAnalyticsSummary> {
    try {
      const analytics = await this.getCombinedAnalytics(startDate, endDate);
      
      const summary: BatteryAnalyticsSummary = {
        totalVehicles: analytics.length,
        rul: {
          averagePrediction: 0,
          healthDistribution: {},
          criticalVehicles: 0
        },
        soc: {
          averageCharge: 0,
          chargeDistribution: {},
          lowBatteryVehicles: 0
        },
        soh: {
          averageHealth: 0,
          healthDistribution: {},
          criticalVehicles: 0
        },
        lastUpdated: new Date().toISOString()
      };

      if (analytics.length === 0) {
        return summary;
      }

      // Calculate RUL statistics
      const rulData = analytics.filter(a => a.rul);
      if (rulData.length > 0) {
        summary.rul.averagePrediction = rulData.reduce((sum, a) => sum + (a.rul?.prediction || 0), 0) / rulData.length;
        rulData.forEach(a => {
          const stage = a.rul?.health_stage || 'unknown';
          summary.rul.healthDistribution[stage] = (summary.rul.healthDistribution[stage] || 0) + 1;
          if (stage.toLowerCase().includes('critical')) {
            summary.rul.criticalVehicles++;
          }
        });
      }

      // Calculate SOC statistics
      const socData = analytics.filter(a => a.soc);
      if (socData.length > 0) {
        summary.soc.averageCharge = socData.reduce((sum, a) => sum + (a.soc?.prediction || 0), 0) / socData.length;
        socData.forEach(a => {
          const soc = a.soc?.prediction || 0;
          let level = 'High';
          if (soc < 20) {
            level = 'Critical';
            summary.soc.lowBatteryVehicles++;
          } else if (soc < 50) {
            level = 'Low';
          } else if (soc < 80) {
            level = 'Medium';
          }
          summary.soc.chargeDistribution[level] = (summary.soc.chargeDistribution[level] || 0) + 1;
        });
      }

      // Calculate SOH statistics
      const sohData = analytics.filter(a => a.soh);
      if (sohData.length > 0) {
        summary.soh.averageHealth = sohData.reduce((sum, a) => sum + (a.soh?.prediction || 0), 0) / sohData.length;
        sohData.forEach(a => {
          const status = a.soh?.health_status || 'unknown';
          summary.soh.healthDistribution[status] = (summary.soh.healthDistribution[status] || 0) + 1;
          if (a.soh?.is_critical) {
            summary.soh.criticalVehicles++;
          }
        });
      }

      return summary;
    } catch (error) {
      console.error('BatteryAnalyticsService: Error calculating summary:', error);
      throw error;
    }
  }
}
