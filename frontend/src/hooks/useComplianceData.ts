import { useState, useEffect, useCallback } from 'react';
import type { 
  ComplianceMetrics, 
  ComplianceBadge, 
  ComplianceViolation, 
  VehicleCertification,
  AccessLog,
  RegulatoryReport,
  EmergencyResponse,
  AuditTrail
} from '../types';
import { generateComplianceMetrics, generateComplianceReportData } from '../utils/complianceCalculations';

interface ComplianceData {
  metrics: ComplianceMetrics;
  badges: ComplianceBadge[];
  violations: ComplianceViolation[];
  certifications: VehicleCertification[];
  accessLogs: AccessLog[];
  reports: RegulatoryReport[];
  emergencyResponses: EmergencyResponse[];
  auditTrails: AuditTrail[];
  loading: boolean;
  error: string | null;
}

export const useComplianceData = () => {
  const [data, setData] = useState<ComplianceData>({
    metrics: {
      overallScore: 0,
      safetyScore: 0,
      environmentalScore: 0,
      operationalScore: 0,
      trendsData: [],
      violations: { total: 0, resolved: 0, pending: 0, byType: {} },
      certifications: { total: 0, valid: 0, expiring: 0, expired: 0 },
    },
    badges: [],
    violations: [],
    certifications: [],
    accessLogs: [],
    reports: [],
    emergencyResponses: [],
    auditTrails: [],
    loading: true,
    error: null,
  });

  // Mock data for demonstration
  const mockBadges: ComplianceBadge[] = [
    {
      id: 'badge_1',
      type: 'safety',
      name: 'OSHA Safety Compliance',
      status: 'active',
      issuedDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      issuingAuthority: 'OSHA',
      description: 'Occupational Safety and Health Administration compliance certification',
    },
    {
      id: 'badge_2',
      type: 'environmental',
      name: 'EPA Environmental Compliance',
      status: 'active',
      issuedDate: new Date('2024-03-01'),
      expiryDate: new Date('2025-03-01'),
      issuingAuthority: 'EPA',
      description: 'Environmental Protection Agency compliance certification',
    },
    {
      id: 'badge_3',
      type: 'operational',
      name: 'DOT Commercial Vehicle License',
      status: 'warning',
      issuedDate: new Date('2023-06-01'),
      expiryDate: new Date('2024-12-31'),
      issuingAuthority: 'DOT',
      description: 'Department of Transportation commercial vehicle operation license',
    },
  ];

  const mockViolations: ComplianceViolation[] = [
    {
      id: 'violation_1',
      type: 'restricted_area',
      severity: 'major',
      description: 'Vehicle EV-001 entered restricted warehouse area without proper authorization',
      location: { lat: 40.7128, lng: -74.0060, address: 'Warehouse District A' },
      timestamp: new Date('2024-12-10T14:30:00Z'),
      correctionRequired: true,
      reportedBy: 'system',
    },
    {
      id: 'violation_2',
      type: 'speed_limit',
      severity: 'minor',
      description: 'Vehicle EV-003 exceeded speed limit in loading zone',
      location: { lat: 40.7589, lng: -73.9851, address: 'Loading Zone B' },
      timestamp: new Date('2024-12-08T09:15:00Z'),
      resolvedAt: new Date('2024-12-09T10:00:00Z'),
      correctionRequired: false,
      reportedBy: 'system',
    },
    {
      id: 'violation_3',
      type: 'certification',
      severity: 'critical',
      description: 'Driver certification expired for hazmat transport',
      timestamp: new Date('2024-12-05T16:45:00Z'),
      correctionRequired: true,
      reportedBy: 'manual',
    },
  ];

  const mockCertifications: VehicleCertification[] = [
    {
      id: 'cert_1',
      name: 'Commercial Vehicle Safety Inspection',
      type: 'safety',
      issuedDate: new Date('2024-06-01'),
      expiryDate: new Date('2025-06-01'),
      issuingBody: 'State Motor Vehicle Department',
      certificateNumber: 'CVS-2024-001',
      status: 'valid',
    },
    {
      id: 'cert_2',
      name: 'Hazmat Transportation License',
      type: 'operational',
      issuedDate: new Date('2023-12-01'),
      expiryDate: new Date('2024-12-01'),
      issuingBody: 'Department of Transportation',
      certificateNumber: 'HMT-2023-045',
      status: 'expiring',
    },
    {
      id: 'cert_3',
      name: 'Environmental Impact Assessment',
      type: 'environmental',
      issuedDate: new Date('2024-01-01'),
      expiryDate: new Date('2027-01-01'),
      issuingBody: 'Environmental Protection Agency',
      certificateNumber: 'EIA-2024-012',
      status: 'valid',
    },
  ];

  const mockAccessLogs: AccessLog[] = [
    {
      id: 'access_1',
      vehicleId: 'EV-001',
      driverId: 'driver_123',
      areaId: 'area_warehouse_a',
      areaName: 'Warehouse A - Restricted Zone',
      accessType: 'entry',
      timestamp: new Date('2024-12-13T08:30:00Z'),
      duration: 45,
      authorized: true,
      reportedBy: 'system',
    },
    {
      id: 'access_2',
      vehicleId: 'EV-002',
      areaId: 'area_loading_b',
      areaName: 'Loading Zone B',
      accessType: 'violation',
      timestamp: new Date('2024-12-12T14:15:00Z'),
      authorized: false,
      violationType: 'unauthorized_entry',
      reportedBy: 'security',
    },
    {
      id: 'access_3',
      vehicleId: 'EV-003',
      driverId: 'driver_456',
      areaId: 'area_maintenance',
      areaName: 'Maintenance Bay',
      accessType: 'exit',
      timestamp: new Date('2024-12-11T16:45:00Z'),
      duration: 120,
      authorized: true,
      reportedBy: 'system',
    },
  ];

  const mockAuditTrails: AuditTrail[] = [
    {
      id: 'audit_1',
      entityType: 'vehicle',
      entityId: 'EV-001',
      action: 'update',
      description: 'Vehicle compliance status updated to compliant',
      userId: 'user_123',
      userName: 'John Smith',
      timestamp: new Date('2024-12-13T10:30:00Z'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      changes: {
        complianceStatus: { old: 'warning', new: 'compliant' },
        lastAudit: { old: '2024-11-01', new: '2024-12-13' },
      },
      severity: 'info',
      category: 'compliance',
    },
    {
      id: 'audit_2',
      entityType: 'area',
      entityId: 'area_warehouse_a',
      action: 'access',
      description: 'Unauthorized access attempt detected',
      userId: 'system',
      userName: 'System',
      timestamp: new Date('2024-12-12T14:15:00Z'),
      ipAddress: '10.0.0.50',
      severity: 'warning',
      category: 'security',
    },
    {
      id: 'audit_3',
      entityType: 'driver',
      entityId: 'driver_456',
      action: 'violation',
      description: 'Driver certification expired - access revoked',
      userId: 'compliance_system',
      userName: 'Compliance System',
      timestamp: new Date('2024-12-10T09:00:00Z'),
      severity: 'critical',
      category: 'compliance',
    },
    {
      id: 'audit_4',
      entityType: 'system',
      entityId: 'emergency_response',
      action: 'emergency',
      description: 'Emergency response protocol activated for fire incident',
      userId: 'user_456',
      userName: 'Sarah Johnson',
      timestamp: new Date('2024-12-09T16:45:00Z'),
      ipAddress: '192.168.1.105',
      severity: 'critical',
      category: 'operational',
    },
    {
      id: 'audit_5',
      entityType: 'vehicle',
      entityId: 'EV-002',
      action: 'create',
      description: 'New industrial vehicle added to fleet',
      userId: 'user_789',
      userName: 'Mike Wilson',
      timestamp: new Date('2024-12-08T11:20:00Z'),
      ipAddress: '192.168.1.102',
      changes: {
        vehicleType: { old: null, new: 'forklift' },
        complianceStatus: { old: null, new: 'pending' },
      },
      severity: 'info',
      category: 'operational',
    },
  ];

  const loadComplianceData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate metrics from mock data
      const metrics = generateComplianceMetrics(
        mockBadges,
        mockViolations,
        mockCertifications,
        mockAccessLogs
      );

      setData({
        metrics,
        badges: mockBadges,
        violations: mockViolations,
        certifications: mockCertifications,
        accessLogs: mockAccessLogs,
        reports: [], // Would be loaded from API
        emergencyResponses: [], // Would be loaded from API
        auditTrails: mockAuditTrails,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load compliance data',
      }));
    }
  }, []);

  const resolveViolation = useCallback(async (violationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        violations: prev.violations.map(violation =>
          violation.id === violationId
            ? { ...violation, resolvedAt: new Date() }
            : violation
        ),
      }));

      // Recalculate metrics
      const updatedViolations = data.violations.map(violation =>
        violation.id === violationId
          ? { ...violation, resolvedAt: new Date() }
          : violation
      );
      
      const updatedMetrics = generateComplianceMetrics(
        data.badges,
        updatedViolations,
        data.certifications,
        data.accessLogs
      );

      setData(prev => ({ ...prev, metrics: updatedMetrics }));
    } catch (error) {
      console.error('Failed to resolve violation:', error);
    }
  }, [data.badges, data.violations, data.certifications, data.accessLogs]);

  const generateReport = useCallback(async (reportType: string) => {
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = generateComplianceReportData(
        reportType,
        [], // vehicles would be passed here
        data.violations,
        data.badges,
        data.certifications,
        data.accessLogs
      );

      const newReport: RegulatoryReport = {
        id: `report_${Date.now()}`,
        type: reportType as any,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Compliance Report`,
        reportingPeriod: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date(),
        },
        status: 'draft',
        generatedBy: 'system',
        generatedAt: new Date(),
        regulatoryBody: 'Fleet Management Authority',
        data: reportData,
        attachments: [],
      };

      setData(prev => ({
        ...prev,
        reports: [newReport, ...prev.reports],
      }));

      return newReport;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }, [data.violations, data.badges, data.certifications, data.accessLogs]);

  const triggerEmergencyResponse = useCallback(async (emergencyType: string) => {
    try {
      // Simulate emergency response trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const emergencyResponse: EmergencyResponse = {
        id: `emergency_${Date.now()}`,
        type: emergencyType as any,
        severity: 'high',
        status: 'active',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'Fleet Operations Center',
        },
        reportedAt: new Date(),
        reportedBy: 'fleet_manager',
        description: `Emergency response triggered for ${emergencyType}`,
        actions: [],
        responders: [],
        followUpRequired: true,
      };

      setData(prev => ({
        ...prev,
        emergencyResponses: [emergencyResponse, ...prev.emergencyResponses],
      }));

      return emergencyResponse;
    } catch (error) {
      console.error('Failed to trigger emergency response:', error);
      throw error;
    }
  }, []);

  const exportAccessLogs = useCallback(async () => {
    try {
      // Simulate export functionality
      const csvContent = [
        'ID,Vehicle ID,Driver ID,Area Name,Access Type,Timestamp,Authorized,Duration',
        ...data.accessLogs.map(log => 
          `${log.id},${log.vehicleId},${log.driverId || ''},${log.areaName},${log.accessType},${log.timestamp.toISOString()},${log.authorized},${log.duration || ''}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export access logs:', error);
    }
  }, [data.accessLogs]);

  const exportAuditTrail = useCallback(async () => {
    try {
      // Simulate export functionality
      const csvContent = [
        'ID,Entity Type,Entity ID,Action,Description,User,Timestamp,Severity,Category,IP Address',
        ...data.auditTrails.map(trail => 
          `${trail.id},${trail.entityType},${trail.entityId},${trail.action},"${trail.description}",${trail.userName},${trail.timestamp.toISOString()},${trail.severity},${trail.category},${trail.ipAddress || ''}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit trail:', error);
    }
  }, [data.auditTrails]);

  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  return {
    ...data,
    refreshData: loadComplianceData,
    resolveViolation,
    generateReport,
    triggerEmergencyResponse,
    exportAccessLogs,
    exportAuditTrail,
  };
};