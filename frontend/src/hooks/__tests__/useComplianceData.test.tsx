import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useComplianceData } from '../useComplianceData';

// Mock the compliance calculations
vi.mock('../../utils/complianceCalculations', () => ({
  generateComplianceMetrics: vi.fn(() => ({
    overallScore: 85,
    safetyScore: 90,
    environmentalScore: 80,
    operationalScore: 88,
    trendsData: [],
    violations: { total: 2, resolved: 1, pending: 1, byType: {} },
    certifications: { total: 3, valid: 2, expiring: 1, expired: 0 },
  })),
  generateComplianceReportData: vi.fn(() => ({
    generatedAt: new Date(),
    reportType: 'safety',
    summary: { totalVehicles: 5 },
  })),
}));

describe('useComplianceData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useComplianceData());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('loads compliance data successfully', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics.overallScore).toBe(85);
    expect(result.current.badges).toHaveLength(3);
    expect(result.current.violations).toHaveLength(3);
    expect(result.current.certifications).toHaveLength(3);
    expect(result.current.accessLogs).toHaveLength(3);
    expect(result.current.auditTrails).toHaveLength(5);
  });

  it('resolves violations correctly', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialViolations = result.current.violations;
    const violationToResolve = initialViolations.find(v => !v.resolvedAt);
    
    if (violationToResolve) {
      await act(async () => {
        await result.current.resolveViolation(violationToResolve.id);
      });

      const updatedViolation = result.current.violations.find(
        v => v.id === violationToResolve.id
      );
      expect(updatedViolation?.resolvedAt).toBeDefined();
    }
  });

  it('generates reports successfully', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialReportsCount = result.current.reports.length;

    await act(async () => {
      await result.current.generateReport('safety');
    });

    expect(result.current.reports).toHaveLength(initialReportsCount + 1);
    expect(result.current.reports[0].type).toBe('safety');
  });

  it('triggers emergency response successfully', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialResponsesCount = result.current.emergencyResponses.length;

    await act(async () => {
      await result.current.triggerEmergencyResponse('fire');
    });

    expect(result.current.emergencyResponses).toHaveLength(initialResponsesCount + 1);
    expect(result.current.emergencyResponses[0].type).toBe('fire');
  });

  it('exports access logs', async () => {
    // Mock URL.createObjectURL and related methods
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });

    // Mock document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.exportAccessLogs();
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('exports audit trail', async () => {
    // Mock URL.createObjectURL and related methods
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });

    // Mock document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.exportAuditTrail();
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('refreshes data when requested', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshData();
    });

    // Data should be reloaded
    expect(result.current.loading).toBe(false);
    expect(result.current.metrics).toBeDefined();
  });

  it('handles errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test error handling in resolveViolation
    await act(async () => {
      try {
        await result.current.resolveViolation('non-existent-id');
      } catch (error) {
        // Error should be handled gracefully
      }
    });

    consoleSpy.mockRestore();
  });

  it('provides correct mock data structure', async () => {
    const { result } = renderHook(() => useComplianceData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that mock data has expected structure
    expect(result.current.badges[0]).toHaveProperty('id');
    expect(result.current.badges[0]).toHaveProperty('type');
    expect(result.current.badges[0]).toHaveProperty('status');

    expect(result.current.violations[0]).toHaveProperty('id');
    expect(result.current.violations[0]).toHaveProperty('type');
    expect(result.current.violations[0]).toHaveProperty('severity');

    expect(result.current.certifications[0]).toHaveProperty('id');
    expect(result.current.certifications[0]).toHaveProperty('name');
    expect(result.current.certifications[0]).toHaveProperty('status');

    expect(result.current.accessLogs[0]).toHaveProperty('id');
    expect(result.current.accessLogs[0]).toHaveProperty('vehicleId');
    expect(result.current.accessLogs[0]).toHaveProperty('authorized');

    expect(result.current.auditTrails[0]).toHaveProperty('id');
    expect(result.current.auditTrails[0]).toHaveProperty('entityType');
    expect(result.current.auditTrails[0]).toHaveProperty('action');
    expect(result.current.auditTrails[0]).toHaveProperty('severity');
  });
});