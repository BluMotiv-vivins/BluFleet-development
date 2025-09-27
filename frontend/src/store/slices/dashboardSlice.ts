import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { KPIData, DashboardFilters, TimeRange } from '../../types';
import type { KPICalculationResult } from '../../utils/kpiCalculations';

interface DashboardState {
  kpis: KPIData;
  kpiDetails: KPICalculationResult | null;
  filters: DashboardFilters;
  timeRange: TimeRange;
  refreshInterval: number;
  lastUpdated: string | null;
  previousPeriodData: Partial<KPIData> | null;
}

// Mock KPI data for initial state
const mockKPIs: KPIData = {
  totalVehicles: 127,
  activeVehicles: 122,
  chargingVehicles: 3,
  maintenanceVehicles: 2,
  averageBatteryLevel: 74.2,
  averageBatteryHealth: 86,
  monthlySavings: 47280,
  co2Reduction: 12.4,
};

const initialState: DashboardState = {
  kpis: mockKPIs,
  kpiDetails: null,
  filters: {
    timeRange: '24h',
    vehicleTypes: [],
    locations: [],
  },
  timeRange: '24h',
  refreshInterval: 30000, // 30 seconds
  lastUpdated: new Date().toISOString(),
  previousPeriodData: {
    totalVehicles: 125,
    averageBatteryHealth: 84,
    monthlySavings: 44200,
    co2Reduction: 11.8,
  },
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateKPIs: (state, action: PayloadAction<Partial<KPIData>>) => {
      state.kpis = { ...state.kpis, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    updateKPIDetails: (state, action: PayloadAction<KPICalculationResult>) => {
      state.kpiDetails = action.payload;
      state.kpis = {
        totalVehicles: action.payload.totalVehicles,
        activeVehicles: action.payload.activeVehicles,
        chargingVehicles: action.payload.chargingVehicles,
        maintenanceVehicles: action.payload.maintenanceVehicles,
        averageBatteryLevel: action.payload.averageBatteryLevel,
        averageBatteryHealth: action.payload.averageBatteryHealth,
        monthlySavings: action.payload.monthlySavings,
        co2Reduction: action.payload.co2Reduction,
      };
      state.lastUpdated = new Date().toISOString();
    },
    setFilters: (state, action: PayloadAction<Partial<DashboardFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload;
      if (action.payload !== 'custom') {
        state.filters.timeRange = action.payload;
      }
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setPreviousPeriodData: (state, action: PayloadAction<Partial<KPIData>>) => {
      state.previousPeriodData = action.payload;
    },
    refreshDashboard: (state) => {
      state.lastUpdated = new Date().toISOString();
      // Simulate slight variations in KPIs for real-time updates
      if (state.kpiDetails) {
        const variation = (Math.random() - 0.5) * 2;
        state.kpis.averageBatteryLevel = Math.max(60, Math.min(95, state.kpis.averageBatteryLevel + variation));
        state.kpiDetails.averageBatteryLevel = state.kpis.averageBatteryLevel;
      }
    },
  },
});

export const {
  updateKPIs,
  updateKPIDetails,
  setFilters,
  setTimeRange,
  setRefreshInterval,
  setPreviousPeriodData,
  refreshDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;