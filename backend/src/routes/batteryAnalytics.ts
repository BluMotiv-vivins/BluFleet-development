import express from 'express';
import { BatteryAnalyticsService, BatteryAnalytics } from '../services/batteryAnalyticsService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const batteryAnalyticsService = new BatteryAnalyticsService();

// Get combined battery analytics data
router.get('/analytics', authenticate, async (req: express.Request, res) => {
  try {
    console.log('BatteryAnalytics: GET /analytics request received');
    
    const { startDate, endDate, limit = 100, offset = 0, deviceId } = req.query;
    
    // Parse date parameters
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // Last 14 days
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date();

    console.log(`BatteryAnalytics: Fetching data from ${start.toDateString()} to ${end.toDateString()}`);

    // Get combined analytics
    let analytics = await batteryAnalyticsService.getCombinedAnalytics(start, end);

    // Filter by device ID if provided
    if (deviceId) {
      analytics = analytics.filter(a => a.device_id.includes(deviceId as string));
    }

    // Apply pagination
    const totalRecords = analytics.length;
    const paginatedData = analytics
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

    // Map data with ID field for frontend compatibility
    const formattedData = paginatedData.map(record => ({
      id: record.device_id, // Frontend expects 'id' field
      recordId: record.device_id, // Backend uses 'record_id'
      device_id: record.device_id,
      timestamp: record.timestamp,
      rul: record.rul,
      soc: record.soc,
      soh: record.soh
    }));

    console.log(`BatteryAnalytics: Returning ${formattedData.length} of ${totalRecords} total records`);

    res.json({
      success: true,
      data: {
        records: formattedData,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < totalRecords
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BatteryAnalytics: Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch battery analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get battery analytics summary
router.get('/summary', authenticate, async (req: express.Request, res) => {
  try {
    console.log('BatteryAnalytics: GET /summary request received');
    
    const { startDate, endDate } = req.query;
    
    // Parse date parameters
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // Last 14 days
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date();

    console.log(`BatteryAnalytics: Generating summary from ${start.toDateString()} to ${end.toDateString()}`);

    const summary = await batteryAnalyticsService.getBatteryAnalyticsSummary(start, end);

    console.log(`BatteryAnalytics: Summary calculated for ${summary.totalVehicles} vehicles`);

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BatteryAnalytics: Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate battery analytics summary',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get RUL-specific analytics
router.get('/rul', authenticate, async (req: express.Request, res) => {
  try {
    console.log('BatteryAnalytics: GET /rul request received');
    
    const { startDate, endDate, limit = 100, offset = 0, page = 1 } = req.query;
    
    // Convert page to offset if page is provided
    const actualOffset = req.query.page ? (parseInt(page as string) - 1) * parseInt(limit as string) : parseInt(offset as string);
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date();

    // Get RUL files and read data
    const rulFiles = await batteryAnalyticsService.getAvailableFiles(start, end, 'rul');
    let rulData: any[] = [];
    
    for (const file of rulFiles) {
      const records = await batteryAnalyticsService.readRULPredictions(file);
      rulData = rulData.concat(records);
    }

    // Sort by timestamp descending (most recent first)
    rulData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const totalRecords = rulData.length;
    const paginatedData = rulData
      .slice(actualOffset, actualOffset + parseInt(limit as string));

    res.json({
      success: true,
      data: {
        records: paginatedData,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit as string),
          offset: actualOffset,
          page: parseInt(page as string),
          hasMore: actualOffset + parseInt(limit as string) < totalRecords
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BatteryAnalytics: Error fetching RUL data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RUL analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get SOC-specific analytics
router.get('/soc', authenticate, async (req: express.Request, res) => {
  try {
    console.log('BatteryAnalytics: GET /soc request received');
    
    const { startDate, endDate, limit = 100, offset = 0, page = 1 } = req.query;
    
    // Convert page to offset if page is provided
    const actualOffset = req.query.page ? (parseInt(page as string) - 1) * parseInt(limit as string) : parseInt(offset as string);
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date();

    // Get SOC files and read data
    const socFiles = await batteryAnalyticsService.getAvailableFiles(start, end, 'soc');
    let socData: any[] = [];
    
    for (const file of socFiles) {
      const records = await batteryAnalyticsService.readSOCPredictions(file);
      socData = socData.concat(records);
    }

    // Sort by timestamp descending (most recent first)
    socData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const totalRecords = socData.length;
    const paginatedData = socData
      .slice(actualOffset, actualOffset + parseInt(limit as string));

    res.json({
      success: true,
      data: {
        records: paginatedData,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit as string),
          offset: actualOffset,
          page: parseInt(page as string),
          hasMore: actualOffset + parseInt(limit as string) < totalRecords
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BatteryAnalytics: Error fetching SOC data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SOC analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get SOH-specific analytics
router.get('/soh', authenticate, async (req: express.Request, res) => {
  try {
    console.log('BatteryAnalytics: GET /soh request received');
    
    const { startDate, endDate, limit = 100, offset = 0, page = 1 } = req.query;
    
    // Convert page to offset if page is provided
    const actualOffset = req.query.page ? (parseInt(page as string) - 1) * parseInt(limit as string) : parseInt(offset as string);
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date();

    // Get SOH files and read data
    const sohFiles = await batteryAnalyticsService.getAvailableFiles(start, end, 'soh');
    let sohData: any[] = [];
    
    for (const file of sohFiles) {
      const records = await batteryAnalyticsService.readSOHPredictions(file);
      sohData = sohData.concat(records);
    }

    // Sort by timestamp descending (most recent first)
    sohData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const totalRecords = sohData.length;
    const paginatedData = sohData
      .slice(actualOffset, actualOffset + parseInt(limit as string));

    res.json({
      success: true,
      data: {
        records: paginatedData,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit as string),
          offset: actualOffset,
          page: parseInt(page as string),
          hasMore: actualOffset + parseInt(limit as string) < totalRecords
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BatteryAnalytics: Error fetching SOH data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SOH analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
