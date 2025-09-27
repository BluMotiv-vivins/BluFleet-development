import { Router } from 'express';
import maintenanceService, { 
  CreateMaintenanceRequest, 
  UpdateMaintenanceRequest, 
  MaintenanceType, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '../services/maintenanceService';
import { authenticate } from '../middleware/auth';

const router = Router();

// Middleware to check maintenance permissions
const requireMaintenanceRead = (req: any, res: any, next: any) => {
  const hasPermission = req.user?.role === 'admin' || 
                       req.user?.permissions?.includes('*') ||
                       req.user?.permissions?.includes('maintenance.read');
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions for maintenance read' });
  }
  next();
};

const requireMaintenanceWrite = (req: any, res: any, next: any) => {
  const hasPermission = req.user?.role === 'admin' || 
                       req.user?.permissions?.includes('*') ||
                       req.user?.permissions?.includes('maintenance.write');
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions for maintenance write' });
  }
  next();
};

// Get all maintenance records with optional filters
router.get('/', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const {
      status,
      vehicleId,
      technicianId,
      priority,
      type,
      startDate,
      endDate
    } = req.query;

    const records = await maintenanceService.getAllRecords(
      status as MaintenanceStatus,
      vehicleId as string,
      technicianId as string,
      priority as MaintenancePriority,
      type as MaintenanceType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
});

// Get maintenance record by ID
router.get('/:id', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const { id } = req.params;
    const record = await maintenanceService.getRecordById(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    return res.json(record);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    return res.status(500).json({ error: 'Failed to fetch maintenance record' });
  }
});

// Create new maintenance record
router.post('/', authenticate, requireMaintenanceWrite, async (req, res) => {
  try {
    const data: CreateMaintenanceRequest = req.body;
    const createdBy = req.user?.id || 'system';
    
    // Validate required fields
    if (!data.vehicleId || !data.type || !data.priority || !data.title || !data.description || !data.scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date' });
    }

    // Validate enum values
    if (!Object.values(MaintenanceType).includes(data.type)) {
      return res.status(400).json({ error: 'Invalid maintenance type' });
    }

    if (!Object.values(MaintenancePriority).includes(data.priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const newRecord = await maintenanceService.createRecord({
      ...data,
      scheduledDate
    }, createdBy);

    return res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return res.status(500).json({ error: 'Failed to create maintenance record' });
  }
});

// Update maintenance record
router.put('/:id', authenticate, requireMaintenanceWrite, async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateMaintenanceRequest = req.body;
    
    // Validate dates if provided
    if (updates.scheduledDate) {
      const scheduledDate = new Date(updates.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduled date' });
      }
      updates.scheduledDate = scheduledDate;
    }

    if (updates.completedDate) {
      const completedDate = new Date(updates.completedDate);
      if (isNaN(completedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid completed date' });
      }
      updates.completedDate = completedDate;
    }

    // Validate enum values if provided
    if (updates.type && !Object.values(MaintenanceType).includes(updates.type)) {
      return res.status(400).json({ error: 'Invalid maintenance type' });
    }

    if (updates.priority && !Object.values(MaintenancePriority).includes(updates.priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (updates.status && !Object.values(MaintenanceStatus).includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedRecord = await maintenanceService.updateRecord(id, updates);
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    return res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    return res.status(500).json({ error: 'Failed to update maintenance record' });
  }
});

// Delete maintenance record
router.delete('/:id', authenticate, requireMaintenanceWrite, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await maintenanceService.deleteRecord(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    return res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
});

// Update maintenance record status
router.patch('/:id/status', authenticate, requireMaintenanceWrite, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completedDate } = req.body;
    
    if (!Object.values(MaintenanceStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let completedDateObj;
    if (completedDate) {
      completedDateObj = new Date(completedDate);
      if (isNaN(completedDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid completed date' });
      }
    }
    
    const updatedRecord = await maintenanceService.updateRecordStatus(id, status, completedDateObj);
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    return res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    return res.status(500).json({ error: 'Failed to update maintenance status' });
  }
});

// Get all vehicles for maintenance assignment
router.get('/data/vehicles', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const vehicles = await maintenanceService.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get all technicians for maintenance assignment
router.get('/data/technicians', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const technicians = await maintenanceService.getAllTechnicians();
    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

// Get maintenance statistics
router.get('/stats/overview', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const stats = await maintenanceService.getMaintenanceStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance statistics' });
  }
});

// Get maintenance options (types, priorities, statuses)
router.get('/data/options', authenticate, requireMaintenanceRead, async (req, res) => {
  try {
    const options = {
      types: Object.values(MaintenanceType),
      priorities: Object.values(MaintenancePriority),
      statuses: Object.values(MaintenanceStatus)
    };
    res.json(options);
  } catch (error) {
    console.error('Error fetching maintenance options:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance options' });
  }
});

export default router;
