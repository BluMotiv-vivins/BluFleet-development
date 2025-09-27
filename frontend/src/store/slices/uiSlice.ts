import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

interface UIState {
  sidebarCollapsed: boolean;
  activeRoute: string;
  theme: 'light' | 'dark';
  connectionStatus: ConnectionState;
  isOffline: boolean;
  notifications: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  modals: {
    vehicleDetail: {
      open: boolean;
      vehicleId: string | null;
    };
    driverDetail: {
      open: boolean;
      driverId: string | null;
    };
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeRoute: '/',
  theme: 'light',
  connectionStatus: 'disconnected',
  isOffline: false,
  notifications: null,
  modals: {
    vehicleDetail: {
      open: false,
      vehicleId: null,
    },
    driverDetail: {
      open: false,
      driverId: null,
    },
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setActiveRoute: (state, action: PayloadAction<string>) => {
      state.activeRoute = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.notifications = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notifications = null;
    },
    openVehicleModal: (state, action: PayloadAction<string>) => {
      state.modals.vehicleDetail = {
        open: true,
        vehicleId: action.payload,
      };
    },
    closeVehicleModal: (state) => {
      state.modals.vehicleDetail = {
        open: false,
        vehicleId: null,
      };
    },
    openDriverModal: (state, action: PayloadAction<string>) => {
      state.modals.driverDetail = {
        open: true,
        driverId: action.payload,
      };
    },
    closeDriverModal: (state) => {
      state.modals.driverDetail = {
        open: false,
        driverId: null,
      };
    },
    setConnectionStatus: (state, action: PayloadAction<ConnectionState>) => {
      state.connectionStatus = action.payload;
    },
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setActiveRoute,
  setTheme,
  showNotification,
  hideNotification,
  openVehicleModal,
  closeVehicleModal,
  openDriverModal,
  closeDriverModal,
  setConnectionStatus,
  setOfflineStatus,
} = uiSlice.actions;

export default uiSlice.reducer;