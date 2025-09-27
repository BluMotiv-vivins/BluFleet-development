import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle } from '../types/vehicle';
import { useApiData, useApiMutation } from '../hooks/useAnalyticsData';

interface VehicleContextProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: Error | null;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  updateVehicle: (id: string, updateData: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  refreshVehicles: () => void;
}

const VehicleContext = createContext<VehicleContextProps | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // API hooks
  const {
    data: vehiclesResponse,
    loading: vehiclesLoading,
    error: vehiclesError,
    refresh: refreshVehicles
  } = useApiData<{ vehicles: Vehicle[], pagination: any }>('/api/vehicles', 30000); // Refresh every 30 seconds
  
  const { mutate: updateVehicleApi, loading: updateLoading } = useApiMutation<Vehicle>();
  const { mutate: deleteVehicleApi, loading: deleteLoading } = useApiMutation<any>();
  
  const vehicles = vehiclesResponse?.vehicles || [];
  
  const updateVehicle = async (id: string, updateData: Partial<Vehicle>) => {
    try {
      await updateVehicleApi(`/api/vehicles/${id}`, 'PUT', updateData);
      refreshVehicles();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  };
  
  const deleteVehicle = async (id: string) => {
    try {
      await deleteVehicleApi(`/api/vehicles/${id}`, 'DELETE');
      refreshVehicles();
      if (selectedVehicle?.vehicle_id === id) {
        setSelectedVehicle(null);
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  };
  
  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        isLoading: vehiclesLoading || updateLoading || deleteLoading,
        error: vehiclesError,
        selectedVehicle,
        setSelectedVehicle,
        updateVehicle,
        deleteVehicle,
        refreshVehicles
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicleContext = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicleContext must be used within a VehicleProvider');
  }
  return context;
};
