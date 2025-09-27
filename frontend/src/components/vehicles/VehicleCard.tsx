import React from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { Vehicle, VehicleCardProps } from '../../types/vehicle';
import { BatteryStatus } from './BatteryStatus';
import { StatusBadge } from './StatusBadge';
import { DriverInfo } from './DriverInfo';
import { TelemetryDisplay } from './TelemetryDisplay';
import { VehicleAlert } from './VehicleAlert';

/**
 * VehicleCard displays summary information about a vehicle
 * Shows status, battery level, telemetry data and quick actions
 */
export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelect,
  onUpdate,
  loading = false
}) => {
  const handleQuickStatusUpdate = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    onUpdate({ status: newStatus });
  };

  const batteryLevel = vehicle.telemetry?.battery_soc_percentage?.value;
  const currentSpeed = vehicle.telemetry?.speed_kmh?.value;
  const estimatedRange = vehicle.telemetry?.estimated_range_km?.value;
  const powerConsumption = vehicle.telemetry?.power_consumption_kw?.value;

  return (
    <div 
      data-testid={`vehicle-card-${vehicle.vehicle_id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name="truck" className="h-5 w-5 text-blue-600" />
            <span data-testid="vehicle-name" className="font-medium text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </span>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
        <div data-testid="vehicle-year-vin" className="text-sm text-gray-600 dark:text-gray-400">
          {vehicle.year} • VIN: {vehicle.vin_number}
        </div>
        <div data-testid="vehicle-specs" className="text-xs text-gray-500 dark:text-gray-500">
          {vehicle.vehicle_type} • {vehicle.battery_capacity_kwh}kWh
        </div>
      </div>

      {/* Battery and Status */}
      <div className="p-4">
        <BatteryStatus 
          batteryLevel={batteryLevel} 
          isCharging={vehicle.status === 'charging'} 
        />

        {/* Telemetry Data */}
        <TelemetryDisplay
          currentSpeed={currentSpeed}
          estimatedRange={estimatedRange}
          powerConsumption={powerConsumption}
          maxChargingPower={vehicle.max_charging_power_kw}
        />

        {/* Driver Assignment */}
        <DriverInfo 
          driverName={vehicle.driver_name} 
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2">
          {vehicle.status === 'active' && (
            <Button
              data-testid="maintenance-button"
              size="sm"
              variant="outline"
              onClick={(e) => handleQuickStatusUpdate(e, 'maintenance')}
              disabled={loading}
              className="flex-1 text-xs"
            >
              <Icon name="tool" className="h-3 w-3 mr-1" />
              Maintenance
            </Button>
          )}
          {vehicle.status === 'maintenance' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleQuickStatusUpdate(e, 'active')}
              disabled={loading}
              className="flex-1 text-xs"
            >
              <Icon name="check" className="h-3 w-3 mr-1" />
              Activate
            </Button>
          )}
          {vehicle.status === 'inactive' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleQuickStatusUpdate(e, 'active')}
              disabled={loading}
              className="flex-1 text-xs"
            >
              <Icon name="play" className="h-3 w-3 mr-1" />
              Activate
            </Button>
          )}
          
          <Button
            data-testid="details-button"
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="flex-1 text-xs"
          >
            <Icon name="eye" className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {batteryLevel && batteryLevel < 20 && (
        <VehicleAlert 
          type="low-battery"
          message="Low battery - charge soon" 
        />
      )}
      
      {vehicle.status === 'maintenance' && (
        <VehicleAlert 
          type="maintenance"
          message="Vehicle in maintenance mode" 
        />
      )}
    </div>
  );
};
