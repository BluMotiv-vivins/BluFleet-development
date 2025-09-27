import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Vehicle, ChargingStation, Geofence, Route, MapViewport, MapLayer } from '../../types';

// Set Mapbox access token - in production this should come from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZmxlZXR2b2x0IiwiYSI6ImNsczBkZjBkZjBhZGkya3BjZGZkZjBkZjAifQ.example';

// Validate Mapbox token
if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example')) {
  console.warn('Mapbox access token is not configured properly. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

interface FleetMapProps {
  vehicles: Vehicle[];
  chargingStations: ChargingStation[];
  geofences: Geofence[];
  routes: Route[];
  viewport?: MapViewport;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onStationClick?: (station: ChargingStation) => void;
  onMapLoad?: () => void;
  onMapError?: (error: Error) => void;
  enableRealTimeTracking?: boolean;
  trackingUpdateInterval?: number;
  className?: string;
}

const FleetMap: React.FC<FleetMapProps> = memo(({
  vehicles,
  chargingStations,
  geofences,
  routes,
  viewport = {
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 12
  },
  onVehicleClick,
  onStationClick,
  onMapLoad,
  onMapError,
  enableRealTimeTracking = true,
  // trackingUpdateInterval = 5000, // Future use for real-time tracking intervals
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const animationFrameRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'vehicles', name: 'Vehicles', visible: true, type: 'vehicles' },
    { id: 'charging-stations', name: 'Charging Stations', visible: true, type: 'charging-stations' },
    { id: 'geofences', name: 'Geofences', visible: true, type: 'geofences' },
    { id: 'routes', name: 'Routes', visible: true, type: 'routes' }
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [viewport.longitude, viewport.latitude],
        zoom: viewport.zoom,
        bearing: viewport.bearing || 0,
        pitch: viewport.pitch || 0,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      // Add attribution control in a custom position
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
        onMapLoad?.();
      });

      map.current.on('error', (e) => {
        const errorMessage = e.error?.message || 'Map failed to load';
        setMapError(errorMessage);
        onMapError?.(new Error(errorMessage));
      });

      // Handle style load errors
      map.current.on('style.load', () => {
        setMapError(null);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize map';
      setMapError(errorMessage);
      onMapError?.(new Error(errorMessage));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Smooth marker animation function
  const animateMarkerToPosition = useCallback((marker: mapboxgl.Marker, newLngLat: [number, number], duration: number = 1000) => {
    const startLngLat = marker.getLngLat();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentLng = startLngLat.lng + (newLngLat[0] - startLngLat.lng) * easeProgress;
      const currentLat = startLngLat.lat + (newLngLat[1] - startLngLat.lat) * easeProgress;
      
      marker.setLngLat([currentLng, currentLat]);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, []);

  // Update vehicle markers with real-time tracking
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const vehicleLayer = layers.find(l => l.id === 'vehicles');
    if (!vehicleLayer?.visible) {
      // Remove all vehicle markers if layer is hidden
      Object.entries(markersRef.current).forEach(([key, marker]) => {
        if (key.startsWith('vehicle-')) {
          marker.remove();
          delete markersRef.current[key];
        }
      });
      return;
    }

    // Update existing markers or create new ones
    vehicles.forEach(vehicle => {
      const markerId = `vehicle-${vehicle.id}`;
      const existingMarker = markersRef.current[markerId];
      
      if (existingMarker) {
        // Update existing marker position with animation if real-time tracking is enabled
        const newPosition: [number, number] = [vehicle.location.lng, vehicle.location.lat];
        const currentPosition = existingMarker.getLngLat();
        
        // Check if position has changed significantly (more than ~10 meters)
        const distance = Math.sqrt(
          Math.pow((newPosition[0] - currentPosition.lng) * 111320 * Math.cos(currentPosition.lat * Math.PI / 180), 2) +
          Math.pow((newPosition[1] - currentPosition.lat) * 111320, 2)
        );
        
        if (distance > 10) {
          if (enableRealTimeTracking) {
            animateMarkerToPosition(existingMarker, newPosition);
          } else {
            existingMarker.setLngLat(newPosition);
          }
        }
        
        // Update marker appearance if status changed
        const markerElement = existingMarker.getElement();
        updateVehicleMarkerElement(markerElement, vehicle);
        
        // Update popup content
        const popup = existingMarker.getPopup();
        if (popup) {
          popup.setHTML(createVehiclePopupContent(vehicle));
        }
      } else {
        // Create new marker
        const el = createVehicleMarkerElement(vehicle);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([vehicle.location.lng, vehicle.location.lat])
          .addTo(map.current!);

        // Add click handler
        el.addEventListener('click', () => {
          onVehicleClick?.(vehicle);
        });

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(createVehiclePopupContent(vehicle));
        
        marker.setPopup(popup);
        markersRef.current[markerId] = marker;
      }
    });

    // Remove markers for vehicles that no longer exist
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      if (key.startsWith('vehicle-')) {
        const vehicleId = key.replace('vehicle-', '');
        if (!vehicles.find(v => v.id === vehicleId)) {
          marker.remove();
          delete markersRef.current[key];
        }
      }
    });
  }, [vehicles, mapLoaded, layers, enableRealTimeTracking, animateMarkerToPosition]);

  // Update charging station markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const stationLayer = layers.find(l => l.id === 'charging-stations');
    if (!stationLayer?.visible) {
      // Remove all station markers if layer is hidden
      Object.entries(markersRef.current).forEach(([key, marker]) => {
        if (key.startsWith('station-')) {
          marker.remove();
          delete markersRef.current[key];
        }
      });
      return;
    }

    // Update existing markers or create new ones
    chargingStations.forEach(station => {
      const markerId = `station-${station.id}`;
      const existingMarker = markersRef.current[markerId];
      
      if (existingMarker) {
        // Update marker appearance if status changed
        const markerElement = existingMarker.getElement();
        updateStationMarkerElement(markerElement, station);
        
        // Update popup content
        const popup = existingMarker.getPopup();
        if (popup) {
          popup.setHTML(createStationPopupContent(station));
        }
      } else {
        // Create new marker
        const el = createStationMarkerElement(station);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([station.location.lng, station.location.lat])
          .addTo(map.current!);

        // Add click handler
        el.addEventListener('click', () => {
          onStationClick?.(station);
        });

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(createStationPopupContent(station));
        
        marker.setPopup(popup);
        markersRef.current[markerId] = marker;
      }
    });

    // Remove markers for stations that no longer exist
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      if (key.startsWith('station-')) {
        const stationId = key.replace('station-', '');
        if (!chargingStations.find(s => s.id === stationId)) {
          marker.remove();
          delete markersRef.current[key];
        }
      }
    });
  }, [chargingStations, mapLoaded, layers]);

  // Update geofences
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const geofenceLayer = layers.find(l => l.id === 'geofences');
    
    // Remove existing geofence layers
    if (map.current.getLayer('geofences-fill')) {
      map.current.removeLayer('geofences-fill');
    }
    if (map.current.getLayer('geofences-line')) {
      map.current.removeLayer('geofences-line');
    }
    if (map.current.getSource('geofences')) {
      map.current.removeSource('geofences');
    }

    if (!geofenceLayer?.visible || geofences.length === 0) return;

    // Create GeoJSON for geofences
    const geofenceGeoJSON = {
      type: 'FeatureCollection' as const,
      features: geofences.map(geofence => ({
        type: 'Feature' as const,
        properties: {
          id: geofence.id,
          name: geofence.name,
          type: geofence.type
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [geofence.coordinates.map(coord => [coord.lng, coord.lat])]
        }
      }))
    };

    // Add geofence source
    map.current.addSource('geofences', {
      type: 'geojson',
      data: geofenceGeoJSON
    });

    // Add geofence fill layer
    map.current.addLayer({
      id: 'geofences-fill',
      type: 'fill',
      source: 'geofences',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1
      }
    });

    // Add geofence border layer
    map.current.addLayer({
      id: 'geofences-line',
      type: 'line',
      source: 'geofences',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });
  }, [geofences, mapLoaded, layers]);

  // Update routes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const routeLayer = layers.find(l => l.id === 'routes');
    
    // Remove existing route layers
    if (map.current.getLayer('routes')) {
      map.current.removeLayer('routes');
    }
    if (map.current.getSource('routes')) {
      map.current.removeSource('routes');
    }

    if (!routeLayer?.visible || routes.length === 0) return;

    // Create GeoJSON for routes
    const routeGeoJSON = {
      type: 'FeatureCollection' as const,
      features: routes.map(route => ({
        type: 'Feature' as const,
        properties: {
          id: route.id,
          name: route.name,
          status: route.status
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: route.waypoints.map(point => [point.lng, point.lat])
        }
      }))
    };

    // Add route source
    map.current.addSource('routes', {
      type: 'geojson',
      data: routeGeoJSON
    });

    // Add route layer
    map.current.addLayer({
      id: 'routes',
      type: 'line',
      source: 'routes',
      paint: {
        'line-color': [
          'match',
          ['get', 'status'],
          'active', '#10b981',
          'planned', '#f59e0b',
          'completed', '#6b7280',
          '#ef4444'
        ],
        'line-width': 3
      }
    });
  }, [routes, mapLoaded, layers]);

  const createVehicleMarkerElement = (vehicle: Vehicle) => {
    const el = document.createElement('div');
    el.className = 'vehicle-marker cursor-pointer transition-all duration-300 hover:scale-110';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '14px';
    el.style.fontWeight = 'bold';
    el.style.color = 'white';
    el.style.transition = 'all 0.3s ease';
    
    // Add data attributes for easier testing and updates
    el.setAttribute('data-vehicle-id', vehicle.id);
    el.setAttribute('data-vehicle-status', vehicle.status);

    updateVehicleMarkerElement(el, vehicle);
    return el;
  };

  const updateVehicleMarkerElement = (el: HTMLElement, vehicle: Vehicle) => {
    // Set color based on status
    switch (vehicle.status) {
      case 'active':
        el.style.backgroundColor = '#10b981';
        break;
      case 'charging':
        el.style.backgroundColor = '#f59e0b';
        break;
      case 'maintenance':
        el.style.backgroundColor = '#ef4444';
        break;
      case 'offline':
        el.style.backgroundColor = '#6b7280';
        break;
    }

    // Update data attributes
    el.setAttribute('data-vehicle-status', vehicle.status);

    // Add vehicle type icon
    const icon = getVehicleIcon(vehicle.type);
    el.innerHTML = icon;

    // Add pulsing animation for active vehicles
    if (vehicle.status === 'active') {
      el.style.animation = 'pulse 2s infinite';
    } else {
      el.style.animation = 'none';
    }
  };

  const createStationMarkerElement = (station: ChargingStation) => {
    const el = document.createElement('div');
    el.className = 'station-marker cursor-pointer transition-all duration-300 hover:scale-110';
    el.style.width = '28px';
    el.style.height = '28px';
    el.style.borderRadius = '4px';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '12px';
    el.style.fontWeight = 'bold';
    el.style.color = 'white';
    el.style.transition = 'all 0.3s ease';
    
    // Add data attributes for easier testing and updates
    el.setAttribute('data-station-id', station.id);
    el.setAttribute('data-station-status', station.status);

    updateStationMarkerElement(el, station);
    return el;
  };

  const updateStationMarkerElement = (el: HTMLElement, station: ChargingStation) => {
    // Set color based on status
    switch (station.status) {
      case 'available':
        el.style.backgroundColor = '#10b981';
        break;
      case 'occupied':
        el.style.backgroundColor = '#f59e0b';
        break;
      case 'maintenance':
        el.style.backgroundColor = '#ef4444';
        break;
      case 'offline':
        el.style.backgroundColor = '#6b7280';
        break;
    }

    // Update data attributes
    el.setAttribute('data-station-status', station.status);

    // Show queue indicator if there's a queue
    const queueIndicator = station.queue.length > 0 ? ` (${station.queue.length})` : '';
    el.innerHTML = `⚡${queueIndicator}`;

    // Add pulsing animation for available stations
    if (station.status === 'available') {
      el.style.animation = 'pulse 3s infinite';
    } else {
      el.style.animation = 'none';
    }
  };

  const createVehiclePopupContent = (vehicle: Vehicle) => {
    const statusColor = 
      vehicle.status === 'active' ? 'text-green-600' :
      vehicle.status === 'charging' ? 'text-yellow-600' :
      vehicle.status === 'maintenance' ? 'text-red-600' :
      'text-gray-600';

    const batteryColor = 
      vehicle.battery.currentLevel > 50 ? 'text-green-600' :
      vehicle.battery.currentLevel > 20 ? 'text-yellow-600' :
      'text-red-600';

    const lastUpdated = new Date().toLocaleTimeString();

    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-sm">${vehicle.name}</h3>
          <span class="text-xs text-gray-500">${getVehicleIcon(vehicle.type)}</span>
        </div>
        
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="font-medium capitalize">${vehicle.type}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium capitalize ${statusColor}">${vehicle.status}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Battery:</span>
            <span class="font-medium ${batteryColor}">${vehicle.battery.currentLevel}%</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Range:</span>
            <span class="font-medium">${vehicle.battery.estimatedRange} mi</span>
          </div>
          
          ${vehicle.driver ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Driver:</span>
              <span class="font-medium">${vehicle.driver.name}</span>
            </div>
          ` : ''}
          
          ${vehicle.location.address ? `
            <div class="mt-2 pt-2 border-t border-gray-200">
              <span class="text-gray-600 text-xs">${vehicle.location.address}</span>
            </div>
          ` : ''}
          
          <div class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Last updated: ${lastUpdated}
          </div>
        </div>
      </div>
    `;
  };

  const createStationPopupContent = (station: ChargingStation) => {
    return `
      <div class="p-2">
        <h3 class="font-semibold text-sm mb-1">${station.name}</h3>
        <p class="text-xs text-gray-600 mb-1">Status: <span class="font-medium">${station.status}</span></p>
        <p class="text-xs text-gray-600 mb-1">Power: ${station.powerOutput}kW</p>
        <p class="text-xs text-gray-600 mb-1">Queue: ${station.queue.length} vehicles</p>
        <p class="text-xs text-gray-600">Rate: $${station.pricing.rate}/${station.pricing.currency}</p>
      </div>
    `;
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return '🚛';
      case 'forklift':
        return '🏗️';
      case 'van':
        return '🚐';
      case 'car':
        return '🚗';
      default:
        return '🚗';
    }
  };

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Map Error Display */}
      {mapError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
          <div className="text-center p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Error</h3>
            <p className="text-gray-600 mb-4">{mapError}</p>
            <p className="text-sm text-gray-500">
              Please check your Mapbox access token configuration.
            </p>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        .vehicle-marker:hover,
        .station-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: white !important;
        }
      `}</style>
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-sm font-semibold mb-2">Map Layers</h4>
        {layers.map(layer => (
          <label key={layer.id} className="flex items-center mb-1 text-xs">
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={() => toggleLayer(layer.id)}
              className="mr-2"
            />
            {layer.name}
          </label>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Active/Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Charging/Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
});

FleetMap.displayName = 'FleetMap';

export default FleetMap;