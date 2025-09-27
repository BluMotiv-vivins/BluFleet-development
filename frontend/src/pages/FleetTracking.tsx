import React, { useState } from 'react';
import { FleetMap } from '../components/map';
import { useMapData } from '../hooks';
import type { Vehicle, ChargingStation } from '../types';
import { Modal } from '../components/ui';

const FleetTracking: React.FC = () => {
  const { vehicles, chargingStations, geofences, routes, viewport, loading, error } = useMapData();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleStationClick = (station: ChargingStation) => {
    setSelectedStation(station);
  };

  const handleMapLoad = () => {
    console.log('Map loaded successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-red-600">
            <p>Error loading map: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Vehicles: {vehicles.length}</span>
          <span>Stations: {chargingStations.length}</span>
          <span>Active Routes: {routes.filter(r => r.status === 'active').length}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <FleetMap
          vehicles={vehicles}
          chargingStations={chargingStations}
          geofences={geofences}
          routes={routes}
          viewport={viewport}
          onVehicleClick={handleVehicleClick}
          onStationClick={handleStationClick}
          onMapLoad={handleMapLoad}
          className="h-[600px]"
        />
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVehicle(null)}
          title={`Vehicle Details - ${selectedVehicle.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedVehicle.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className={`mt-1 text-sm font-medium capitalize ${
                  selectedVehicle.status === 'active' ? 'text-green-600' :
                  selectedVehicle.status === 'charging' ? 'text-yellow-600' :
                  selectedVehicle.status === 'maintenance' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {selectedVehicle.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Battery Level</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle.battery.currentLevel}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Battery Health</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle.battery.health}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Range</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle.battery.estimatedRange} miles</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Charged</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedVehicle.battery.lastCharged).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {selectedVehicle.driver && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle.driver.name}</p>
                <p className="text-xs text-gray-600">{selectedVehicle.driver.email}</p>
              </div>
            )}

            {selectedVehicle.location.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle.location.address}</p>
              </div>
            )}

            {selectedVehicle.alerts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Recent Alerts</label>
                <div className="mt-1 space-y-1">
                  {selectedVehicle.alerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="text-xs p-2 rounded bg-gray-50">
                      <span className={`font-medium ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {alert.title}
                      </span>
                      <p className="text-gray-600">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Charging Station Detail Modal */}
      {selectedStation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStation(null)}
          title={`Charging Station - ${selectedStation.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className={`mt-1 text-sm font-medium capitalize ${
                  selectedStation.status === 'available' ? 'text-green-600' :
                  selectedStation.status === 'occupied' ? 'text-yellow-600' :
                  selectedStation.status === 'maintenance' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {selectedStation.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Power Output</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStation.powerOutput} kW</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Queue Length</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStation.queue.length} vehicles</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pricing</label>
                <p className="mt-1 text-sm text-gray-900">
                  ₹{selectedStation.pricing.rate}/{selectedStation.pricing.currency}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Connector Types</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedStation.connectorTypes.map(type => (
                  <span key={type} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <p className="mt-1 text-sm text-gray-900">{selectedStation.location.address}</p>
            </div>

            {selectedStation.currentVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Vehicle</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStation.currentVehicle}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FleetTracking;