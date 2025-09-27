import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import fleetSlice from './slices/fleetSlice';
import dashboardSlice from './slices/dashboardSlice';
import alertSlice from './slices/alertSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    fleet: fleetSlice,
    dashboard: dashboardSlice,
    alerts: alertSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;