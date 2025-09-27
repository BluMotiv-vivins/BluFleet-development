const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3005;

// Configure AWS
const s3 = new AWS.S3({
  region: 'us-east-1'
});

const BUCKET_NAME = 'blufleet-predictions-20250826';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
  credentials: true
}));
app.use(express.json());

// Utility function to get S3 path for date (US East timezone)
function getS3PathForDate(date) {
  const utcDate = new Date(date);
  // Convert to US East timezone (UTC-5 or UTC-4 depending on DST)
  const easternOffset = -5; // Simplified for EST
  const easternDate = new Date(utcDate.getTime() + (easternOffset * 60 * 60 * 1000));
  
  const year = easternDate.getFullYear();
  const month = String(easternDate.getMonth() + 1).padStart(2, '0');
  const day = String(easternDate.getDate()).padStart(2, '0');
  
  return `predictions/year=${year}/month=${month}/day=${day}/`;
}

// Utility function to get CSV filename for date
function getCsvFileName(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `predictions_${year}${month}${day}.csv`;
}

// Parse CSV data from S3
async function readCsvFromS3(key) {
  try {
    console.log(`Reading CSV from S3: ${key}`);
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    const s3Object = await s3.getObject(params).promise();
    const csvData = s3Object.Body.toString('utf-8');
    
    return new Promise((resolve, reject) => {
      const results = [];
      const csvLines = csvData.split('\n');
      
      if (csvLines.length < 2) {
        resolve([]);
        return;
      }
      
      const headers = csvLines[0].split(',');
      
      for (let i = 1; i < csvLines.length; i++) {
        const line = csvLines[i].trim();
        if (line) {
          const values = line.split(',');
          const record = {};
          
          headers.forEach((header, index) => {
            record[header.trim()] = values[index] ? values[index].trim() : '';
          });
          
          // Convert to expected format
          if (record.record_id) {
            results.push({
              id: record.record_id,
              timestamp: record.timestamp,
              deviceId: record.device_id,
              cycle: parseInt(record.cycle) || 0,
              frequency: parseFloat(record.frequency) || 0,
              zReal: parseFloat(record.z_real) || 0,
              zImag: parseFloat(record.z_imag) || 0,
              rrul: parseFloat(record.rrul) || 0,
              rulPrediction: parseFloat(record.rul_prediction) || 0,
              healthStage: record.health_stage,
              kinesisStream: record.kinesis_stream,
              sagemakerEndpoint: record.sagemaker_endpoint,
              lambdaRequestId: record.lambda_request_id,
              rawDataLocation: record.raw_data_location
            });
          }
        }
      }
      
      resolve(results);
    });
  } catch (error) {
    console.error('Error reading CSV from S3:', error);
    return [];
  }
}

// Get real-time data from S3
async function getRealtimeDataFiles(startDate, endDate) {
  const allData = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    try {
      const s3Path = getS3PathForDate(currentDate);
      const fileName = getCsvFileName(currentDate);
      const fullKey = s3Path + fileName;
      
      console.log(`Checking S3 path: ${fullKey}`);
      
      // Check if file exists
      try {
        await s3.headObject({
          Bucket: BUCKET_NAME,
          Key: fullKey
        }).promise();
        
        // File exists, read it
        const data = await readCsvFromS3(fullKey);
        allData.push(...data);
        console.log(`Found ${data.length} records for ${currentDate.toDateString()}`);
      } catch (headError) {
        if (headError.code === 'NotFound') {
          console.log(`No data file for ${currentDate.toDateString()}`);
        } else {
          throw headError;
        }
      }
    } catch (error) {
      console.error(`Error checking file for ${currentDate.toDateString()}:`, error);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return allData;
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'analytics',
    version: '1.0.0'
  });
});

app.get('/api/analytics/predictions', async (req, res) => {
  try {
    // Get query parameters for filtering
    const {
      startDate: startDateParam,
      endDate: endDateParam,
      deviceId,
      healthStage,
      minConfidence,
      limit = 100,
      offset = 0
    } = req.query;
    
    // Set date range - use query params or default to last 7 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    })();
    
    console.log(`Fetching predictions from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log('Filters:', { deviceId, healthStage, minConfidence, limit, offset });
    
    let data = await getRealtimeDataFiles(startDate, endDate);
    
    // Apply filters
    if (deviceId) {
      data = data.filter(record => record.deviceId === deviceId);
    }
    
    if (healthStage) {
      data = data.filter(record => record.healthStage === healthStage);
    }
    
    if (minConfidence) {
      const minConf = parseFloat(minConfidence);
      data = data.filter(record => record.rulPrediction >= minConf);
    }
    
    // Apply pagination
    const total = data.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    data = data.slice(startIndex, endIndex);

    res.json({
      data: data,
      total: total,
      timestamp: new Date().toISOString(),
      source: 'realtime-s3',
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      filters: {
        deviceId,
        healthStage,
        minConfidence,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch predictions',
      message: error.message
    });
  }
});

app.get('/api/analytics/predictions/latest', async (req, res) => {
  try {
    // Get data for today
    const today = new Date();
    const data = await getRealtimeDataFiles(today, today);
    
    // Get the latest records (up to 10)
    const latestData = data.slice(-10);
    
    res.json({
      data: latestData,
      total: latestData.length,
      timestamp: new Date().toISOString(),
      source: 'realtime-s3'
    });
  } catch (error) {
    console.error('Error fetching latest predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch latest predictions',
      message: error.message
    });
  }
});

app.get('/api/analytics/predictions/summary', async (req, res) => {
  try {
    // Use the same logic as the main predictions endpoint but calculate summary
    const { startDate, endDate, deviceId, healthStage, minConfidence } = req.query;
    
    // Parse date parameters with defaults for last 7 days
    const start = startDate ? new Date(startDate) : (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    })();
    const end = endDate ? new Date(endDate) : new Date();
    
    let data = await getRealtimeDataFiles(start, end);
    
    // Apply filters
    if (deviceId) {
      data = data.filter(item => item.deviceId === deviceId);
    }
    if (healthStage) {
      data = data.filter(item => item.healthStage === healthStage);
    }
    if (minConfidence) {
      const minConf = parseFloat(minConfidence);
      data = data.filter(item => item.rulPrediction >= minConf);
    }
    
    // Calculate summary statistics
    console.log(`Summary calculation: Found ${data.length} records`);
    if (data.length > 0) {
      console.log('Sample record:', JSON.stringify(data[0], null, 2));
      console.log('Health stages in data:', [...new Set(data.map(item => item.healthStage))]);
    }
    
    const summary = {
      totalPredictions: data.length,
      healthyCount: data.filter(item => item.healthStage === 'healthy').length,
      warningCount: data.filter(item => item.healthStage === 'warning').length,
      criticalCount: data.filter(item => item.healthStage === 'critical').length,
      avgRulPrediction: data.length > 0 ? data.reduce((sum, item) => sum + item.rulPrediction, 0) / data.length : 0,
      uniqueDevices: [...new Set(data.map(item => item.deviceId))].length,
      timestamp: new Date().toISOString()
    };
    
    console.log('Calculated summary:', summary);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching predictions summary:', error);
    res.status(500).json({
      error: 'Failed to fetch predictions summary',
      message: error.message
    });
  }
});

app.get('/api/analytics/health/aws', async (req, res) => {
  try {
    const health = {
      s3: 'healthy',
      timestamp: new Date().toISOString()
    };
    
    // Test S3 connection
    try {
      await s3.listObjectsV2({
        Bucket: BUCKET_NAME,
        Prefix: 'predictions/',
        MaxKeys: 1
      }).promise();
      health.s3 = 'healthy';
    } catch (error) {
      health.s3 = 'unhealthy';
      health.s3Error = error.message;
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

// =================
// SIMULATION API ENDPOINTS
// =================

const SIMULATION_BUCKET = 'blufleet-sumo-sim';

// Parse SUMO simulation CSV data from S3
async function readSimulationCsvFromS3(key) {
  try {
    console.log(`Reading simulation CSV from S3: ${key}`);
    const params = {
      Bucket: SIMULATION_BUCKET,
      Key: key
    };
    
    const response = await s3.getObject(params).promise();
    const csvContent = response.Body.toString('utf-8');
    
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(csvContent);
      readable.push(null);
      
      readable
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to our interface
          const record = {
            vehicleId: row.vehicle_id || '',
            depart: parseFloat(row.depart) || 0,
            arrival: parseFloat(row.arrival) || 0,
            duration: parseFloat(row.duration) || 0,
            routeLength: parseFloat(row.routeLength) || 0,
            waitingTime: parseFloat(row.waitingTime) || 0,
            stopTime: parseFloat(row.stopTime) || 0,
            vType: row.vType || '',
            fuelAbs: parseFloat(row.fuel_abs) || 0,
            criticalTurns: parseInt(row.critical_turns) || 0
          };
          results.push(record);
        })
        .on('end', () => {
          console.log(`Parsed ${results.length} simulation records from ${key}`);
          resolve(results);
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error(`Error reading simulation CSV from S3 ${key}:`, error);
    throw error;
  }
}

// Get available simulation files from S3
async function getSimulationFiles() {
  try {
    const params = {
      Bucket: SIMULATION_BUCKET,
      Prefix: 'simulation_outputs/',
      MaxKeys: 100
    };
    
    const response = await s3.listObjectsV2(params).promise();
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing simulation files:', error);
    throw error;
  }
}

// Calculate simulation summary metrics
function calculateSimulationSummary(data) {
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
  const vehicleTypes = {};
  data.forEach(record => {
    vehicleTypes[record.vType] = (vehicleTypes[record.vType] || 0) + 1;
  });

  // Performance metrics
  const averageDuration = totalDuration / totalVehicles;
  const averageWaiting = totalWaiting / totalVehicles;
  const efficiency = Math.max(0, 100 - (averageWaiting / averageDuration) * 100);
  const throughput = totalVehicles / (Math.max(...data.map(r => r.arrival)) / 3600); // vehicles per hour

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

// API endpoint: Get simulation data
app.get('/api/simulation/data', async (req, res) => {
  try {
    console.log('Fetching simulation data...');
    
    // Get available files
    const files = await getSimulationFiles();
    console.log(`Found ${files.length} simulation files`);
    
    if (files.length === 0) {
      return res.json({ records: [], message: 'No simulation files found' });
    }

    // Use the most recent file
    const mostRecentFile = files.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))[0];
    console.log(`Using most recent file: ${mostRecentFile.Key}`);
    
    const data = await readSimulationCsvFromS3(mostRecentFile.Key);
    
    res.json({
      records: data,
      metadata: {
        fileName: mostRecentFile.Key,
        lastModified: mostRecentFile.LastModified,
        size: mostRecentFile.Size,
        totalRecords: data.length
      }
    });
  } catch (error) {
    console.error('Error in /api/simulation/data:', error);
    res.status(500).json({
      error: 'Failed to fetch simulation data',
      message: error.message
    });
  }
});

// API endpoint: Get simulation summary
app.get('/api/simulation/summary', async (req, res) => {
  try {
    console.log('Fetching simulation summary...');
    
    // Get available files
    const files = await getSimulationFiles();
    
    if (files.length === 0) {
      return res.json(calculateSimulationSummary([]));
    }

    // Use the most recent file
    const mostRecentFile = files.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))[0];
    const data = await readSimulationCsvFromS3(mostRecentFile.Key);
    
    const summary = calculateSimulationSummary(data);
    
    res.json(summary);
  } catch (error) {
    console.error('Error in /api/simulation/summary:', error);
    res.status(500).json({
      error: 'Failed to fetch simulation summary',
      message: error.message
    });
  }
});

// API endpoint: List available simulation files
app.get('/api/simulation/files', async (req, res) => {
  try {
    const files = await getSimulationFiles();
    
    const fileList = files.map(file => ({
      key: file.Key,
      name: file.Key.split('/').pop(),
      lastModified: file.LastModified,
      size: file.Size,
      sizeKB: Math.round(file.Size / 1024)
    }));
    
    res.json({ files: fileList });
  } catch (error) {
    console.error('Error in /api/simulation/files:', error);
    res.status(500).json({
      error: 'Failed to list simulation files',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Predictions endpoint: http://localhost:${PORT}/api/analytics/predictions`);
  console.log(`Simulation endpoints: http://localhost:${PORT}/api/simulation/data`);
});
