import React from 'react';

interface FleetOverviewCardProps {
  fleetData: any;
  driverData: any;
}

export const FleetOverviewCard: React.FC<FleetOverviewCardProps> = ({ 
  fleetData, 
  driverData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {fleetData?.totalVehicles || 0}
          </div>
          <div className="text-sm text-gray-600">Total Vehicles</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {fleetData?.activeVehicles || 0}
          </div>
          <div className="text-sm text-gray-600">Active Vehicles</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">
            {driverData?.totalDrivers || 0}
          </div>
          <div className="text-sm text-gray-600">Total Drivers</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {driverData?.activeDrivers || 0}
          </div>
          <div className="text-sm text-gray-600">Active Drivers</div>
        </div>
      </div>
    </div>
  );
};

export default FleetOverviewCard;