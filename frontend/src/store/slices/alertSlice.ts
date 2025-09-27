import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Alert, Vehicle } from '../../types';
import { generateAutomatedAlerts, prioritizeAlerts } from '../../utils/alertGeneration';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  lastAutoGeneration: string | null;
  autoGenerationEnabled: boolean;
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'battery',
    severity: 'medium',
    title: 'Low Battery Alert',
    message: 'Vehicle EV-004 battery level is at 23%',
    vehicleId: 'EV-004',
    timestamp: '2024-12-09T11:45:00Z',
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'maintenance',
    severity: 'low',
    title: 'Maintenance Due',
    message: 'Vehicle EV-009 is due for scheduled maintenance',
    vehicleId: 'EV-009',
    timestamp: '2024-12-09T10:30:00Z',
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'geofence',
    severity: 'high',
    title: 'Geofence Violation',
    message: 'Vehicle EV-012 has exited authorized area',
    vehicleId: 'EV-012',
    timestamp: '2024-12-09T09:15:00Z',
    acknowledged: false,
  },
  {
    id: 'A-004',
    type: 'system',
    severity: 'low',
    title: 'System Update Available',
    message: 'New fleet management system update is available',
    timestamp: '2024-12-09T08:00:00Z',
    acknowledged: true,
  },
  {
    id: 'A-005',
    type: 'safety',
    severity: 'high',
    title: 'Harsh Braking Event',
    message: 'Driver James Wilson performed harsh braking on EV-004',
    vehicleId: 'EV-004',
    driverId: 'D-004',
    timestamp: '2024-12-08T14:22:00Z',
    acknowledged: false,
  },
  {
    id: 'A-006',
    type: 'safety',
    severity: 'medium',
    title: 'Speed Limit Exceeded',
    message: 'Driver Mike Chen exceeded speed limit by 12 mph on EV-002',
    vehicleId: 'EV-002',
    driverId: 'D-002',
    timestamp: '2024-12-08T16:45:00Z',
    acknowledged: false,
  },
  {
    id: 'A-007',
    type: 'safety',
    severity: 'low',
    title: 'Harsh Acceleration',
    message: 'Driver James Wilson performed harsh acceleration on EV-004',
    vehicleId: 'EV-004',
    driverId: 'D-004',
    timestamp: '2024-12-07T11:30:00Z',
    acknowledged: true,
  },
  {
    id: 'A-008',
    type: 'safety',
    severity: 'medium',
    title: 'Sharp Cornering Event',
    message: 'Driver Mike Chen took a sharp corner at high speed on EV-002',
    vehicleId: 'EV-002',
    driverId: 'D-002',
    timestamp: '2024-12-07T09:15:00Z',
    acknowledged: false,
  },
];

const initialState: AlertState = {
  alerts: mockAlerts,
  unreadCount: mockAlerts.filter(alert => !alert.acknowledged).length,
  loading: false,
  lastAutoGeneration: null,
  autoGenerationEnabled: true,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      if (!action.payload.acknowledged) {
        state.unreadCount += 1;
      }
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.resolvedAt = new Date().toISOString();
        if (!alert.acknowledged) {
          alert.acknowledged = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    clearAllAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    generateAutomatedAlertsAction: (state, action: PayloadAction<Vehicle[]>) => {
      if (!state.autoGenerationEnabled) return;
      
      const newAlerts = generateAutomatedAlerts(action.payload);
      
      // Filter out duplicate alerts (same type, vehicle, and recent timestamp)
      const existingAlertKeys = new Set(
        state.alerts
          .filter(alert => !alert.resolvedAt)
          .map(alert => `${alert.type}-${alert.vehicleId}-${alert.severity}`)
      );
      
      const uniqueNewAlerts = newAlerts.filter(alert => {
        const key = `${alert.type}-${alert.vehicleId}-${alert.severity}`;
        return !existingAlertKeys.has(key);
      });
      
      if (uniqueNewAlerts.length > 0) {
        state.alerts = prioritizeAlerts([...uniqueNewAlerts, ...state.alerts]);
        state.unreadCount += uniqueNewAlerts.filter(alert => !alert.acknowledged).length;
      }
      
      state.lastAutoGeneration = new Date().toISOString();
    },
    toggleAutoGeneration: (state, action: PayloadAction<boolean>) => {
      state.autoGenerationEnabled = action.payload;
    },
    addBulkAlerts: (state, action: PayloadAction<Alert[]>) => {
      const newAlerts = action.payload;
      state.alerts = prioritizeAlerts([...newAlerts, ...state.alerts]);
      state.unreadCount += newAlerts.filter(alert => !alert.acknowledged).length;
    },
    markAllAlertsRead: (state) => {
      state.alerts.forEach(alert => {
        if (!alert.acknowledged) {
          alert.acknowledged = true;
        }
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  addAlert,
  acknowledgeAlert,
  resolveAlert,
  clearAllAlerts,
  setLoading,
  generateAutomatedAlertsAction,
  toggleAutoGeneration,
  addBulkAlerts,
  markAllAlertsRead,
} = alertSlice.actions;

export default alertSlice.reducer;