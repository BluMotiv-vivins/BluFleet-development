import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Vehicle, ChargingStation, Geofence, Route, MapViewport } from '../types';

interface UseMapDataReturn {
  vehicles: Vehicle[];
  chargingStations: ChargingStation[];
  geofences: Geofence[];
  routes: Route[];
  viewport: MapViewport;
  loading: boolean;
  error: string | null;
  setViewport: (viewport: MapViewport) => void;
}

export const useMapData = (): UseMapDataReturn => {
  const { vehicles, chargingStations, loading, error } = useSelector((state: RootState) => state.fleet);
  
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 12
  });

  // Mock geofences data - in real app this would come from the store
  const [geofences] = useState<Geofence[]>([
    {
      id: 'warehouse-1',
      name: 'Main Warehouse',
      type: 'polygon',
      coordinates: [
        { lat: 37.7849, lng: -122.4294 },
        { lat: 37.7849, lng: -122.4094 },
        { lat: 37.7649, lng: -122.4094 },
        { lat: 37.7649, lng: -122.4294 },
        { lat: 37.7849, lng: -122.4294 }
      ],
      restrictions: ['authorized_vehicles_only']
    },
    {
      id: 'depot-1',
      name: 'Service Depot',
      type: 'polygon',
      coordinates: [
        { lat: 37.7949, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4394 }
      ],
      restrictions: ['maintenance_only']
    }
  ]);

  // Mock routes data - in real app this would come from the store
  const [routes] = useState<Route[]>([
    {
      id: 'route-1',
      name: 'Delivery Route A',
      waypoints: [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7849, lng: -122.4094 },
        { lat: 37.7949, lng: -122.4194 },
        { lat: 37.7849, lng: -122.4294 }
      ],
      estimatedDuration: 120,
      estimatedDistance: 25.5,
      status: 'active'
    },
    {
      id: 'route-2',
      name: 'Service Route B',
      waypoints: [
        { lat: 37.7649, lng: -122.4394 },
        { lat: 37.7749, lng: -122.4294 },
        { lat: 37.7849, lng: -122.4394 }
      ],
      estimatedDuration: 90,
      estimatedDistance: 18.2,
      status: 'planned'
    }
  ]);

  // Auto-fit viewport to show all vehicles when vehicles change
  useEffect(() => {
    if (vehicles.length > 0) {
      const lats = vehicles.map(v => v.location.lat);
      const lngs = vehicles.map(v => v.location.lng);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      
      // Calculate zoom level based on bounds
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let zoom = 12;
      if (maxDiff > 0.1) zoom = 10;
      if (maxDiff > 0.5) zoom = 8;
      if (maxDiff > 1) zoom = 6;
      
      setViewport({
        latitude: centerLat,
        longitude: centerLng,
        zoom
      });
    }
  }, [vehicles]);

  return {
    vehicles,
    chargingStations,
    geofences,
    routes,
    viewport,
    loading,
    error,
    setViewport
  };
};