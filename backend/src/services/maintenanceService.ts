// Maintenance Management Service
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number; // in hours
  actualDuration?: number; // in hours
  notes?: string;
  attachments?: string[];
  parts?: MaintenancePart[];
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

export interface CreateMaintenanceRequest {
  vehicleId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  title: string;
  description: string;
  scheduledDate: Date;
  assignedTo?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  notes?: string;
  parts?: Omit<MaintenancePart, 'id'>[];
}

export interface UpdateMaintenanceRequest {
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  title?: string;
  description?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  parts?: Omit<MaintenancePart, 'id'>[];
}

export enum MaintenanceType {
  SCHEDULED = 'scheduled',
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
  BATTERY_SERVICE = 'battery_service',
  TIRE_SERVICE = 'tire_service',
  BRAKE_SERVICE = 'brake_service',
  ENGINE_SERVICE = 'engine_service',
  SOFTWARE_UPDATE = 'software_update'
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed',
  PENDING_PARTS = 'pending_parts'
}

// Mock vehicle data
interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  batteryCapacity: number;
  status: string;
}

// Mock user data for assignment
interface MaintenanceTechnician {
  id: string;
  name: string;
  specialization: string[];
  availability: boolean;
}

class MaintenanceStorage {
  private records: Map<string, MaintenanceRecord> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private technicians: Map<string, MaintenanceTechnician> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      { id: '1', name: 'Fleet Vehicle 001', model: 'Tesla Model S', year: 2023, batteryCapacity: 100, status: 'active' },
      { id: '2', name: 'Fleet Vehicle 002', model: 'BMW iX3', year: 2022, batteryCapacity: 80, status: 'active' },
      { id: '3', name: 'Fleet Vehicle 003', model: 'Nissan Leaf', year: 2023, batteryCapacity: 62, status: 'active' },
      { id: '4', name: 'Fleet Vehicle 004', model: 'Audi e-tron', year: 2022, batteryCapacity: 95, status: 'active' },
      { id: '5', name: 'Fleet Vehicle 005', model: 'Hyundai Kona Electric', year: 2023, batteryCapacity: 64, status: 'maintenance' }
    ];

    mockVehicles.forEach(vehicle => this.vehicles.set(vehicle.id, vehicle));

    // Mock technicians
    const mockTechnicians: MaintenanceTechnician[] = [
      { id: '1', name: 'John Smith', specialization: ['battery_service', 'engine_service'], availability: true },
      { id: '2', name: 'Sarah Johnson', specialization: ['brake_service', 'tire_service'], availability: true },
      { id: '3', name: 'Mike Davis', specialization: ['software_update', 'inspection'], availability: false },
      { id: '4', name: 'Lisa Wilson', specialization: ['battery_service', 'preventive'], availability: true }
    ];

    mockTechnicians.forEach(tech => this.technicians.set(tech.id, tech));

    // Create some sample maintenance records
    this.createSampleRecords();
  }

  private createSampleRecords() {
    const sampleRecords: MaintenanceRecord[] = [
      {
        id: '1',
        vehicleId: '1',
        vehicleName: 'Fleet Vehicle 001',
        type: MaintenanceType.BATTERY_SERVICE,
        priority: MaintenancePriority.MEDIUM,
        status: MaintenanceStatus.SCHEDULED,
        title: 'Battery Health Check',
        description: 'Routine battery health assessment and calibration',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedTo: '1',
        assignedToName: 'John Smith',
        createdBy: '1',
        createdByName: 'System Administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedCost: 150,
        estimatedDuration: 2,
        parts: []
      },
      {
        id: '2',
        vehicleId: '2',
        vehicleName: 'Fleet Vehicle 002',
        type: MaintenanceType.INSPECTION,
        priority: MaintenancePriority.LOW,
        status: MaintenanceStatus.COMPLETED,
        title: 'Monthly Safety Inspection',
        description: 'Regular safety and performance inspection',
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        assignedTo: '3',
        assignedToName: 'Mike Davis',
        createdBy: '2',
        createdByName: 'Fleet Manager',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedCost: 100,
        actualCost: 95,
        estimatedDuration: 1,
        actualDuration: 0.8,
        parts: []
      },
      {
        id: '3',
        vehicleId: '5',
        vehicleName: 'Fleet Vehicle 005',
        type: MaintenanceType.EMERGENCY,
        priority: MaintenancePriority.CRITICAL,
        status: MaintenanceStatus.IN_PROGRESS,
        title: 'Battery System Fault',
        description: 'Critical battery management system error detected',
        scheduledDate: new Date(),
        assignedTo: '1',
        assignedToName: 'John Smith',
        createdBy: '1',
        createdByName: 'System Administrator',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        estimatedCost: 500,
        estimatedDuration: 4,
        notes: 'Urgent repair required - vehicle out of service',
        parts: [
          {
            id: '1',
            name: 'Battery Management Unit',
            partNumber: 'BMU-001',
            quantity: 1,
            unitCost: 300,
            totalCost: 300,
            supplier: 'Tesla Parts'
          }
        ]
      }
    ];

    sampleRecords.forEach(record => this.records.set(record.id, record));
  }

  getAllRecords(): MaintenanceRecord[] {
    return Array.from(this.records.values());
  }

  getRecordById(id: string): MaintenanceRecord | null {
    return this.records.get(id) || null;
  }

  getRecordsByVehicle(vehicleId: string): MaintenanceRecord[] {
    return Array.from(this.records.values()).filter(record => record.vehicleId === vehicleId);
  }

  getRecordsByStatus(status: MaintenanceStatus): MaintenanceRecord[] {
    return Array.from(this.records.values()).filter(record => record.status === status);
  }

  getRecordsByTechnician(technicianId: string): MaintenanceRecord[] {
    return Array.from(this.records.values()).filter(record => record.assignedTo === technicianId);
  }

  createRecord(record: MaintenanceRecord): void {
    this.records.set(record.id, record);
  }

  updateRecord(id: string, updates: Partial<MaintenanceRecord>): MaintenanceRecord | null {
    const record = this.records.get(id);
    if (!record) return null;

    const updatedRecord = { ...record, ...updates, updatedAt: new Date() };
    this.records.set(id, updatedRecord);
    return updatedRecord;
  }

  deleteRecord(id: string): boolean {
    return this.records.delete(id);
  }

  getAllVehicles(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }

  getAllTechnicians(): MaintenanceTechnician[] {
    return Array.from(this.technicians.values());
  }

  getVehicleById(id: string): Vehicle | null {
    return this.vehicles.get(id) || null;
  }

  getTechnicianById(id: string): MaintenanceTechnician | null {
    return this.technicians.get(id) || null;
  }
}

class MaintenanceService {
  private storage = new MaintenanceStorage();

  async getAllRecords(
    status?: MaintenanceStatus,
    vehicleId?: string,
    technicianId?: string,
    priority?: MaintenancePriority,
    type?: MaintenanceType,
    startDate?: Date,
    endDate?: Date
  ): Promise<MaintenanceRecord[]> {
    let records = this.storage.getAllRecords();

    // Apply filters
    if (status) {
      records = records.filter(record => record.status === status);
    }
    if (vehicleId) {
      records = records.filter(record => record.vehicleId === vehicleId);
    }
    if (technicianId) {
      records = records.filter(record => record.assignedTo === technicianId);
    }
    if (priority) {
      records = records.filter(record => record.priority === priority);
    }
    if (type) {
      records = records.filter(record => record.type === type);
    }
    if (startDate) {
      records = records.filter(record => record.scheduledDate >= startDate);
    }
    if (endDate) {
      records = records.filter(record => record.scheduledDate <= endDate);
    }

    // Sort by scheduled date (most recent first)
    records.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

    return records;
  }

  async getRecordById(id: string): Promise<MaintenanceRecord | null> {
    return this.storage.getRecordById(id);
  }

  async createRecord(data: CreateMaintenanceRequest, createdBy: string): Promise<MaintenanceRecord> {
    const vehicle = this.storage.getVehicleById(data.vehicleId);
    const technician = data.assignedTo ? this.storage.getTechnicianById(data.assignedTo) : null;

    const record: MaintenanceRecord = {
      id: this.generateId(),
      vehicleId: data.vehicleId,
      vehicleName: vehicle?.name,
      type: data.type,
      priority: data.priority,
      status: MaintenanceStatus.SCHEDULED,
      title: data.title,
      description: data.description,
      scheduledDate: data.scheduledDate,
      assignedTo: data.assignedTo,
      assignedToName: technician?.name,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedCost: data.estimatedCost,
      estimatedDuration: data.estimatedDuration,
      notes: data.notes,
      parts: data.parts?.map(part => ({ ...part, id: this.generateId() })) || []
    };

    this.storage.createRecord(record);
    return record;
  }

  async updateRecord(id: string, updates: UpdateMaintenanceRequest): Promise<MaintenanceRecord | null> {
    const record = this.storage.getRecordById(id);
    if (!record) return null;

    const updatedData: Partial<MaintenanceRecord> = {};
    
    // Copy all updates except parts
    Object.keys(updates).forEach(key => {
      if (key !== 'parts') {
        (updatedData as any)[key] = (updates as any)[key];
      }
    });

    // Update technician name if assignedTo changed
    if (updates.assignedTo !== undefined) {
      const technician = updates.assignedTo ? this.storage.getTechnicianById(updates.assignedTo) : null;
      updatedData.assignedToName = technician?.name;
    }

    // Update parts with IDs
    if (updates.parts) {
      updatedData.parts = updates.parts.map(part => ({ ...part, id: this.generateId() }));
    }

    return this.storage.updateRecord(id, updatedData);
  }

  async deleteRecord(id: string): Promise<boolean> {
    return this.storage.deleteRecord(id);
  }

  async updateRecordStatus(id: string, status: MaintenanceStatus, completedDate?: Date): Promise<MaintenanceRecord | null> {
    const updates: Partial<MaintenanceRecord> = { status };
    
    if (status === MaintenanceStatus.COMPLETED && completedDate) {
      updates.completedDate = completedDate;
    }

    return this.storage.updateRecord(id, updates);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.storage.getAllVehicles();
  }

  async getAllTechnicians(): Promise<MaintenanceTechnician[]> {
    return this.storage.getAllTechnicians();
  }

  async getMaintenanceStats(): Promise<{
    totalRecords: number;
    scheduledCount: number;
    inProgressCount: number;
    completedCount: number;
    overdueCount: number;
    priorityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
    averageCompletionTime: number;
    totalCost: number;
    upcomingMaintenance: MaintenanceRecord[];
  }> {
    const records = this.storage.getAllRecords();
    const now = new Date();
    
    const stats = {
      totalRecords: records.length,
      scheduledCount: records.filter(r => r.status === MaintenanceStatus.SCHEDULED).length,
      inProgressCount: records.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length,
      completedCount: records.filter(r => r.status === MaintenanceStatus.COMPLETED).length,
      overdueCount: records.filter(r => 
        r.status === MaintenanceStatus.SCHEDULED && r.scheduledDate < now
      ).length,
      priorityDistribution: {} as Record<string, number>,
      typeDistribution: {} as Record<string, number>,
      averageCompletionTime: 0,
      totalCost: 0,
      upcomingMaintenance: records
        .filter(r => r.status === MaintenanceStatus.SCHEDULED && r.scheduledDate >= now)
        .slice(0, 5)
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
    };

    // Calculate distributions
    records.forEach(record => {
      stats.priorityDistribution[record.priority] = (stats.priorityDistribution[record.priority] || 0) + 1;
      stats.typeDistribution[record.type] = (stats.typeDistribution[record.type] || 0) + 1;
    });

    // Calculate average completion time and total cost
    const completedRecords = records.filter(r => r.status === MaintenanceStatus.COMPLETED && r.actualDuration);
    if (completedRecords.length > 0) {
      const totalDuration = completedRecords.reduce((sum, r) => sum + (r.actualDuration || 0), 0);
      stats.averageCompletionTime = totalDuration / completedRecords.length;
    }

    stats.totalCost = records.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);

    return stats;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export default new MaintenanceService();
