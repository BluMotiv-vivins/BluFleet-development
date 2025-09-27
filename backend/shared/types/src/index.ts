// Core Entity Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  tenantId: string;
  version: number;
}

// User and Authentication Types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  roles: UserRole[];
  preferences: UserPreferences;
}

export interface UserRole extends BaseEntity {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface Role extends BaseEntity {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface Permission extends BaseEntity {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  alertTypes: string[];
}

export interface DashboardPreferences {
  layout: string;
  widgets: string[];
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

// Vehicle Types
export interface Vehicle extends BaseEntity {
  vin: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  batteryCapacity: number;
  maxRange: number;
  currentLocation: Location;
  assignedDriverId?: string;
  fleetId: string;
  specifications: VehicleSpecifications;
  insurance: InsuranceInfo;
  maintenance: MaintenanceInfo;
  telemetry: VehicleTelemetry;
}

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  TRUCK = 'truck',
  VAN = 'van',
  BUS = 'bus',
  FORKLIFT = 'forklift',
  OTHER = 'other'
}

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CHARGING = 'charging',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  EMERGENCY = 'emergency'
}

export interface VehicleSpecifications {
  length: number;
  width: number;
  height: number;
  weight: number;
  maxPayload: number;
  chargingPorts: ChargingPortType[];
  autonomyLevel: number;
  features: string[];
}

export enum ChargingPortType {
  TYPE1 = 'type1',
  TYPE2 = 'type2',
  CCS = 'ccs',
  CHADEMO = 'chademo',
  TESLA = 'tesla'
}

// Location and Geofencing Types
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  address?: string;
  timestamp: Date;
}

export interface Geofence extends BaseEntity {
  name: string;
  description?: string;
  type: GeofenceType;
  coordinates: Location[];
  radius?: number;
  isActive: boolean;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedVehicles?: string[];
  schedule?: GeofenceSchedule;
}

export enum GeofenceType {
  CIRCULAR = 'circular',
  POLYGON = 'polygon',
  CORRIDOR = 'corridor'
}

export interface GeofenceSchedule {
  timezone: string;
  rules: ScheduleRule[];
}

export interface ScheduleRule {
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Battery and Energy Types
export interface BatteryInfo {
  currentLevel: number;
  health: number;
  temperature: number;
  voltage: number;
  current: number;
  cycleCount: number;
  estimatedRange: number;
  chargingRate?: number;
  lastCharged: Date;
  degradationRate: number;
}

export interface ChargingStation extends BaseEntity {
  name: string;
  location: Location;
  status: ChargingStationStatus;
  connectorTypes: ChargingPortType[];
  maxPower: number;
  currentPower: number;
  pricing: ChargingPricing;
  availability: ChargingAvailability;
  networkProvider?: string;
  ocppVersion?: string;
  features: string[];
}

export enum ChargingStationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  OUT_OF_ORDER = 'out_of_order',
  MAINTENANCE = 'maintenance'
}

export interface ChargingPricing {
  currency: string;
  energyRate: number;
  timeRate?: number;
  sessionFee?: number;
  parkingFee?: number;
  membershipDiscount?: number;
}

export interface ChargingAvailability {
  totalConnectors: number;
  availableConnectors: number;
  reservedConnectors: number;
  outOfOrderConnectors: number;
  queue: ChargingQueueEntry[];
}

export interface ChargingQueueEntry {
  vehicleId: string;
  estimatedWaitTime: number;
  priority: number;
  requestedAt: Date;
}

export interface ChargingSession extends BaseEntity {
  vehicleId: string;
  stationId: string;
  connectorId: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number;
  cost: number;
  status: ChargingSessionStatus;
  paymentMethod?: string;
  transactionId?: string;
}

export enum ChargingSessionStatus {
  INITIATED = 'initiated',
  CHARGING = 'charging',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
  FAILED = 'failed'
}

// Maintenance Types
export interface MaintenanceRecord extends BaseEntity {
  vehicleId: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  technicianId?: string;
  cost?: number;
  parts: MaintenancePart[];
  notes?: string;
  attachments: string[];
}

export enum MaintenanceType {
  SCHEDULED = 'scheduled',
  UNSCHEDULED = 'unscheduled',
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency'
}

export enum MaintenanceCategory {
  BATTERY = 'battery',
  BRAKES = 'brakes',
  TIRES = 'tires',
  ELECTRICAL = 'electrical',
  SOFTWARE = 'software',
  HVAC = 'hvac',
  BODY = 'body',
  GENERAL = 'general'
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface MaintenancePart {
  partNumber: string;
  name: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  warrantyPeriod?: number;
}

export interface MaintenanceInfo {
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  totalMileage: number;
  serviceIntervalMiles: number;
  serviceIntervalDays: number;
  maintenanceScore: number;
  upcomingServices: MaintenanceSchedule[];
}

export interface MaintenanceSchedule {
  serviceType: string;
  intervalMiles: number;
  intervalDays: number;
  lastServiceMiles: number;
  lastServiceDate: Date;
  nextServiceMiles: number;
  nextServiceDate: Date;
  isOverdue: boolean;
}

// Safety and Compliance Types
export interface SafetyIncident extends BaseEntity {
  vehicleId: string;
  driverId?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: Location;
  timestamp: Date;
  status: IncidentStatus;
  reportedBy: string;
  investigatedBy?: string;
  resolution?: string;
  attachments: string[];
  witnesses: string[];
}

export enum IncidentType {
  ACCIDENT = 'accident',
  NEAR_MISS = 'near_miss',
  BREAKDOWN = 'breakdown',
  THEFT = 'theft',
  VANDALISM = 'vandalism',
  FIRE = 'fire',
  MEDICAL = 'medical',
  ENVIRONMENTAL = 'environmental'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface ComplianceViolation extends BaseEntity {
  vehicleId: string;
  driverId?: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  location?: Location;
  timestamp: Date;
  fineAmount?: number;
  status: ViolationStatus;
  reportedBy: ReportSource;
  resolvedAt?: Date;
  correctionRequired: boolean;
}

export enum ViolationType {
  SPEED_LIMIT = 'speed_limit',
  RESTRICTED_AREA = 'restricted_area',
  OPERATING_HOURS = 'operating_hours',
  WEIGHT_LIMIT = 'weight_limit',
  EMISSION_ZONE = 'emission_zone',
  PARKING = 'parking',
  CERTIFICATION = 'certification',
  SAFETY = 'safety'
}

export enum ViolationSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

export enum ViolationStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  DISPUTED = 'disputed',
  DISMISSED = 'dismissed'
}

export enum ReportSource {
  SYSTEM_AUTOMATIC = 'system_automatic',
  DRIVER_REPORT = 'driver_report',
  MANAGER_REPORT = 'manager_report',
  EXTERNAL_AUTHORITY = 'external_authority',
  THIRD_PARTY = 'third_party'
}

// Driver Types
export interface Driver extends BaseEntity {
  employeeId: string;
  userId: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate: Date;
  certifications: DriverCertification[];
  status: DriverStatus;
  assignedVehicles: string[];
  performanceScore: number;
  safetyScore: number;
  ecoScore: number;
  totalMilesDriven: number;
  totalHoursDriven: number;
  violationCount: number;
  incidentCount: number;
}

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated'
}

export interface DriverCertification {
  type: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  certificateNumber: string;
  isValid: boolean;
}

// Trip and Route Types
export interface Trip extends BaseEntity {
  vehicleId: string;
  driverId: string;
  startLocation: Location;
  endLocation: Location;
  plannedRoute?: Route;
  actualRoute: Location[];
  startTime: Date;
  endTime?: Date;
  distance: number;
  duration: number;
  energyConsumed: number;
  averageSpeed: number;
  maxSpeed: number;
  status: TripStatus;
  purpose?: string;
  notes?: string;
}

export enum TripStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  INTERRUPTED = 'interrupted'
}

export interface Route extends BaseEntity {
  name: string;
  description?: string;
  waypoints: Location[];
  distance: number;
  estimatedDuration: number;
  estimatedEnergyConsumption: number;
  trafficConditions?: TrafficCondition[];
  restrictions: RouteRestriction[];
  isOptimized: boolean;
  optimizationCriteria: OptimizationCriteria;
}

export interface TrafficCondition {
  location: Location;
  severity: TrafficSeverity;
  description: string;
  estimatedDelay: number;
  timestamp: Date;
}

export enum TrafficSeverity {
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
  SEVERE = 'severe'
}

export interface RouteRestriction {
  type: RestrictionType;
  description: string;
  timeWindows?: TimeWindow[];
  vehicleTypes?: VehicleType[];
  maxWeight?: number;
  maxHeight?: number;
}

export enum RestrictionType {
  TIME_BASED = 'time_based',
  VEHICLE_TYPE = 'vehicle_type',
  WEIGHT_LIMIT = 'weight_limit',
  HEIGHT_LIMIT = 'height_limit',
  EMISSION_ZONE = 'emission_zone',
  PERMIT_REQUIRED = 'permit_required'
}

export interface TimeWindow {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export enum OptimizationCriteria {
  SHORTEST_DISTANCE = 'shortest_distance',
  FASTEST_TIME = 'fastest_time',
  LOWEST_ENERGY = 'lowest_energy',
  AVOID_TRAFFIC = 'avoid_traffic',
  BALANCED = 'balanced'
}

// Telemetry and IoT Types
export interface VehicleTelemetry {
  timestamp: Date;
  location: Location;
  battery: BatteryInfo;
  speed: number;
  heading: number;
  odometer: number;
  engineStatus: EngineStatus;
  diagnostics: DiagnosticCode[];
  sensors: SensorReading[];
  connectivity: ConnectivityInfo;
}

export enum EngineStatus {
  OFF = 'off',
  IDLE = 'idle',
  DRIVING = 'driving',
  CHARGING = 'charging',
  ERROR = 'error'
}

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: DiagnosticSeverity;
  timestamp: Date;
  isActive: boolean;
}

export enum DiagnosticSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface SensorReading {
  sensorId: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
  status: SensorStatus;
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  HUMIDITY = 'humidity',
  VIBRATION = 'vibration',
  PROXIMITY = 'proximity',
  LIGHT = 'light'
}

export enum SensorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export interface ConnectivityInfo {
  signalStrength: number;
  networkType: NetworkType;
  dataUsage: number;
  lastConnected: Date;
  isOnline: boolean;
}

export enum NetworkType {
  CELLULAR_2G = '2g',
  CELLULAR_3G = '3g',
  CELLULAR_4G = '4g',
  CELLULAR_5G = '5g',
  WIFI = 'wifi',
  SATELLITE = 'satellite'
}

// Alert and Notification Types
export interface Alert extends BaseEntity {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: AlertSource;
  entityType: string;
  entityId: string;
  location?: Location;
  timestamp: Date;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalationLevel: number;
  metadata: Record<string, any>;
}

export enum AlertType {
  BATTERY_LOW = 'battery_low',
  BATTERY_CRITICAL = 'battery_critical',
  GEOFENCE_VIOLATION = 'geofence_violation',
  SPEED_VIOLATION = 'speed_violation',
  MAINTENANCE_DUE = 'maintenance_due',
  MAINTENANCE_OVERDUE = 'maintenance_overdue',
  CHARGING_FAILED = 'charging_failed',
  VEHICLE_BREAKDOWN = 'vehicle_breakdown',
  EMERGENCY = 'emergency',
  SECURITY_BREACH = 'security_breach',
  SYSTEM_ERROR = 'system_error'
}

export enum AlertSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertSource {
  VEHICLE_TELEMETRY = 'vehicle_telemetry',
  CHARGING_STATION = 'charging_station',
  DRIVER_REPORT = 'driver_report',
  SYSTEM_MONITORING = 'system_monitoring',
  EXTERNAL_API = 'external_api',
  MANUAL_ENTRY = 'manual_entry'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated'
}

// Insurance and Finance Types
export interface InsuranceInfo {
  policyNumber: string;
  provider: string;
  type: InsuranceType;
  coverage: InsuranceCoverage;
  premium: number;
  deductible: number;
  startDate: Date;
  endDate: Date;
  status: InsuranceStatus;
  claims: InsuranceClaim[];
}

export enum InsuranceType {
  COMPREHENSIVE = 'comprehensive',
  THIRD_PARTY = 'third_party',
  COLLISION = 'collision',
  LIABILITY = 'liability'
}

export interface InsuranceCoverage {
  liability: number;
  collision: number;
  comprehensive: number;
  personalInjury: number;
  propertyDamage: number;
}

export enum InsuranceStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export interface InsuranceClaim extends BaseEntity {
  claimNumber: string;
  incidentId?: string;
  type: ClaimType;
  amount: number;
  status: ClaimStatus;
  filedDate: Date;
  settledDate?: Date;
  description: string;
  attachments: string[];
}

export enum ClaimType {
  ACCIDENT = 'accident',
  THEFT = 'theft',
  VANDALISM = 'vandalism',
  NATURAL_DISASTER = 'natural_disaster',
  FIRE = 'fire',
  OTHER = 'other'
}

export enum ClaimStatus {
  FILED = 'filed',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  DENIED = 'denied',
  SETTLED = 'settled'
}

// Fleet and Organization Types
export interface Fleet extends BaseEntity {
  name: string;
  description?: string;
  organizationId: string;
  managerId: string;
  vehicles: string[];
  drivers: string[];
  operatingRegions: string[];
  policies: FleetPolicy[];
  kpis: FleetKPIs;
}

export interface FleetPolicy {
  type: PolicyType;
  name: string;
  description: string;
  rules: PolicyRule[];
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
}

export enum PolicyType {
  SPEED_LIMIT = 'speed_limit',
  OPERATING_HOURS = 'operating_hours',
  GEOFENCE = 'geofence',
  MAINTENANCE = 'maintenance',
  FUEL_EFFICIENCY = 'fuel_efficiency',
  SAFETY = 'safety'
}

export interface PolicyRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface FleetKPIs {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
  averageBatteryHealth: number;
  totalDistance: number;
  energyConsumed: number;
  costSavings: number;
  emissionsSaved: number;
  maintenanceCost: number;
  incidentCount: number;
  complianceScore: number;
}

export interface Organization extends BaseEntity {
  name: string;
  type: OrganizationType;
  industry: string;
  address: Address;
  contactInfo: ContactInfo;
  subscription: Subscription;
  settings: OrganizationSettings;
  fleets: string[];
}

export enum OrganizationType {
  ENTERPRISE = 'enterprise',
  SMB = 'smb',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  primaryEmail: string;
  primaryPhone: string;
  website?: string;
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  features: string[];
  limits: SubscriptionLimits;
  billing: BillingInfo;
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export interface SubscriptionLimits {
  maxVehicles: number;
  maxUsers: number;
  maxFleets: number;
  dataRetentionDays: number;
  apiCallsPerMonth: number;
}

export interface BillingInfo {
  currency: string;
  amount: number;
  billingCycle: BillingCycle;
  paymentMethod: string;
  nextBillingDate: Date;
  invoices: Invoice[];
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
  features: FeatureSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface FeatureSettings {
  realTimeTracking: boolean;
  predictiveMaintenance: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  apiAccess: boolean;
  mobileApp: boolean;
}

export interface IntegrationSettings {
  enabledIntegrations: string[];
  webhookUrls: Record<string, string>;
  apiKeys: Record<string, string>;
}

export interface SecuritySettings {
  mfaRequired: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  ipWhitelist: string[];
  auditLogging: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId: string;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  requestId: string;
  timestamp: Date;
  version: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: ResponseMetadata & {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  requestId?: string;
}

export interface VehicleUpdateMessage extends WebSocketMessage {
  type: 'vehicle_update';
  payload: {
    vehicleId: string;
    updates: Partial<Vehicle>;
  };
}

export interface TelemetryMessage extends WebSocketMessage {
  type: 'telemetry';
  payload: {
    vehicleId: string;
    telemetry: VehicleTelemetry;
  };
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert';
  payload: Alert;
}

export interface ChargingUpdateMessage extends WebSocketMessage {
  type: 'charging_update';
  payload: {
    stationId: string;
    sessionId?: string;
    updates: Partial<ChargingStation | ChargingSession>;
  };
}

// Event Types for Event Sourcing
export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  eventVersion: number;
  timestamp: Date;
  userId?: string;
  tenantId: string;
  metadata?: Record<string, any>;
}

// Integration Types
export interface ExternalIntegration extends BaseEntity {
  name: string;
  type: IntegrationType;
  provider: string;
  configuration: IntegrationConfiguration;
  status: IntegrationStatus;
  lastSyncAt?: Date;
  errorCount: number;
  lastError?: string;
}

export enum IntegrationType {
  TELEMATICS = 'telematics',
  CHARGING_NETWORK = 'charging_network',
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  PAYMENT = 'payment',
  MAPPING = 'mapping',
  WEATHER = 'weather',
  TRAFFIC = 'traffic'
}

export interface IntegrationConfiguration {
  apiUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  certificatePath?: string;
  webhookUrl?: string;
  syncInterval: number;
  retryAttempts: number;
  timeout: number;
  customHeaders?: Record<string, string>;
  customParameters?: Record<string, any>;
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
  RATE_LIMITED = 'rate_limited'
}

// Audit and Logging Types
export interface AuditLog extends BaseEntity {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SystemLog {
  id: string;
  level: LogLevel;
  service: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Export all types
export * from './api';
export * from './events';
export * from './integrations';