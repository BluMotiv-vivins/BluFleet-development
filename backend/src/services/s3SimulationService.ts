import AWS from 'aws-sdk';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface SimulationRecord {
  vehicleId: string;
  depart: number;
  arrival: number;
  duration: number;
  routeLength: number;
  waitingTime: number;
  stopTime: number;
  vType: string;
  fuelAbs: number;
  criticalTurns: number;
}

export interface SimulationSummary {
  totalVehicles: number;
  averageDuration: number;
  averageWaitingTime: number;
  totalDistance: number;
  vehicleTypes: Record<string, number>;
  performanceMetrics: {
    efficiency: number;
    throughput: number;
  };
}

export class S3SimulationService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    const region = 'us-east-1';
    AWS.config.update({ region });
    
    this.s3 = new AWS.S3();
    this.bucketName = 'blufleet-sumo-sim';
  }

  // Parse SUMO simulation CSV data from S3
  async readSimulationCsvFromS3(key: string): Promise<SimulationRecord[]> {
    try {
      console.log(`S3SimulationService: Reading simulation CSV from S3: ${key}`);
      const response = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      if (!response.Body) {
        throw new Error('No data found in S3 simulation object');
      }

      const csvData = response.Body.toString();
      const records: SimulationRecord[] = [];

      return new Promise((resolve, reject) => {
        const stream = Readable.from(csvData);
        
        stream
          .pipe(csv())
          .on('data', (row) => {
            try {
              const record: SimulationRecord = {
                vehicleId: row.vehicle_id || row.vehicleId || '',
                depart: parseFloat(row.depart) || 0,
                arrival: parseFloat(row.arrival) || 0,
                duration: parseFloat(row.duration) || 0,
                routeLength: parseFloat(row.routeLength) || parseFloat(row.route_length) || 0,
                waitingTime: parseFloat(row.waitingTime) || parseFloat(row.waiting_time) || 0,
                stopTime: parseFloat(row.stopTime) || parseFloat(row.stop_time) || 0,
                vType: row.vType || row.v_type || '',
                fuelAbs: parseFloat(row.fuel_abs) || parseFloat(row.fuelAbs) || 0,
                criticalTurns: parseInt(row.critical_turns) || parseInt(row.criticalTurns) || 0
              };
              records.push(record);
            } catch (error) {
              console.warn('S3SimulationService: Error parsing CSV row:', error);
            }
          })
          .on('end', () => {
            console.log(`S3SimulationService: Parsed ${records.length} simulation records from ${key}`);
            resolve(records);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error(`S3SimulationService: Error reading simulation CSV from S3 ${key}:`, error);
      throw error;
    }
  }

  // Get available simulation files from S3
  async getSimulationFiles(): Promise<AWS.S3.Object[]> {
    try {
      console.log('S3SimulationService: Listing simulation files');
      const response = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: 'simulation_outputs/',
        MaxKeys: 100
      }).promise();

      const files = response.Contents || [];
      console.log(`S3SimulationService: Found ${files.length} simulation files`);
      return files;
    } catch (error) {
      console.error('S3SimulationService: Error listing simulation files:', error);
      throw error;
    }
  }

  // Calculate simulation summary metrics
  private calculateSimulationSummary(data: SimulationRecord[]): SimulationSummary {
    if (!data || data.length === 0) {
      return {
        totalVehicles: 0,
        averageDuration: 0,
        averageWaitingTime: 0,
        totalDistance: 0,
        vehicleTypes: {},
        performanceMetrics: {
          efficiency: 0,
          throughput: 0
        }
      };
    }

    const totalVehicles = data.length;
    const totalDuration = data.reduce((sum, record) => sum + record.duration, 0);
    const totalWaiting = data.reduce((sum, record) => sum + record.waitingTime, 0);
    const totalDistance = data.reduce((sum, record) => sum + record.routeLength, 0);
    
    // Vehicle types distribution
    const vehicleTypes: Record<string, number> = {};
    data.forEach(record => {
      vehicleTypes[record.vType] = (vehicleTypes[record.vType] || 0) + 1;
    });

    // Performance metrics
    const averageDuration = totalDuration / totalVehicles;
    const averageWaiting = totalWaiting / totalVehicles;
    const efficiency = Math.max(0, 100 - (averageWaiting / averageDuration) * 100);
    const maxArrival = Math.max(...data.map(r => r.arrival));
    const throughput = maxArrival > 0 ? totalVehicles / (maxArrival / 3600) : 0; // vehicles per hour

    return {
      totalVehicles,
      averageDuration,
      averageWaitingTime: averageWaiting,
      totalDistance,
      vehicleTypes,
      performanceMetrics: {
        efficiency,
        throughput
      }
    };
  }

  // Get simulation data from the most recent file
  async getSimulationData(): Promise<{
    records: SimulationRecord[];
    metadata: {
      fileName: string;
      lastModified: Date | undefined;
      size: number | undefined;
      totalRecords: number;
    };
  }> {
    try {
      console.log('S3SimulationService: Fetching simulation data...');
      
      // Get available files
      const files = await this.getSimulationFiles();
      
      if (files.length === 0) {
        console.log('S3SimulationService: No simulation files found, returning mock data');
        return this.getMockSimulationData();
      }

      // Use the most recent file
      const mostRecentFile = files.sort((a, b) => 
        new Date(b.LastModified!).getTime() - new Date(a.LastModified!).getTime()
      )[0];
      
      console.log(`S3SimulationService: Using most recent file: ${mostRecentFile.Key}`);
      
      const data = await this.readSimulationCsvFromS3(mostRecentFile.Key!);
      
      return {
        records: data,
        metadata: {
          fileName: mostRecentFile.Key!,
          lastModified: mostRecentFile.LastModified,
          size: mostRecentFile.Size,
          totalRecords: data.length
        }
      };
    } catch (error) {
      console.error('S3SimulationService: Error getting simulation data:', error);
      // Fallback to mock data
      return this.getMockSimulationData();
    }
  }

  // Get simulation summary
  async getSimulationSummary(): Promise<SimulationSummary> {
    try {
      console.log('S3SimulationService: Fetching simulation summary...');
      const { records } = await this.getSimulationData();
      return this.calculateSimulationSummary(records);
    } catch (error) {
      console.error('S3SimulationService: Error getting simulation summary:', error);
      return this.calculateSimulationSummary([]);
    }
  }

  // Mock simulation data for fallback
  private getMockSimulationData(): {
    records: SimulationRecord[];
    metadata: {
      fileName: string;
      lastModified: Date;
      size: number;
      totalRecords: number;
    };
  } {
    const mockRecords: SimulationRecord[] = [];
    const vTypes = ['passenger', 'delivery', 'bus', 'truck'];
    
    for (let i = 0; i < 100; i++) {
      mockRecords.push({
        vehicleId: `vehicle_${i.toString().padStart(3, '0')}`,
        depart: Math.random() * 3600, // 0-1 hour
        arrival: Math.random() * 3600 + 3600, // 1-2 hours
        duration: Math.random() * 1800 + 600, // 10-40 minutes
        routeLength: Math.random() * 50000 + 5000, // 5-55 km
        waitingTime: Math.random() * 300, // 0-5 minutes
        stopTime: Math.random() * 180, // 0-3 minutes
        vType: vTypes[Math.floor(Math.random() * vTypes.length)],
        fuelAbs: Math.random() * 10 + 2, // 2-12 liters
        criticalTurns: Math.floor(Math.random() * 5) // 0-4 turns
      });
    }

    return {
      records: mockRecords,
      metadata: {
        fileName: 'mock_simulation.csv',
        lastModified: new Date(),
        size: 10240,
        totalRecords: mockRecords.length
      }
    };
  }
}
