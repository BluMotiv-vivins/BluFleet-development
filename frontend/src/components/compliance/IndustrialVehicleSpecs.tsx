import React from 'react';
import type { Vehicle } from '../../types';

interface IndustrialVehicleSpecsProps {
  vehicle: Vehicle;
}

export const IndustrialVehicleSpecsComponent: React.FC<IndustrialVehicleSpecsProps> = ({ 
  vehicle 
}) => {
  const specs = vehicle.industrialSpecs;

  if (!specs) {
    return (
      <div className="text-center py-8 text-gray-500">
        No industrial specifications available for this vehicle
      </div>
    );
  }

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M17 17a2 2 0 104 0" />
          </svg>
        );
      case 'forklift':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'van':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M17 17a2 2 0 104 0" />
          </svg>
        );
    }
  };

  const getEnvironmentBadgeColor = (environment: string) => {
    switch (environment) {
      case 'indoor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outdoor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mixed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Header */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 text-gray-600">
          {getVehicleTypeIcon(vehicle.type)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{vehicle.name}</h2>
          <p className="text-gray-600 capitalize">{vehicle.type} - Industrial Specifications</p>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Load Capacity */}
        {specs.maxLoadCapacity && (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="font-semibold text-gray-900">Max Load Capacity</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {specs.maxLoadCapacity.toLocaleString()} kg
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Maximum payload capacity
            </p>
          </div>
        )}

        {/* Lift Height */}
        {specs.liftHeight && (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <h3 className="font-semibold text-gray-900">Lift Height</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {specs.liftHeight} m
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Maximum lifting height
            </p>
          </div>
        )}

        {/* Cargo Volume */}
        {specs.cargoVolume && (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="font-semibold text-gray-900">Cargo Volume</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {specs.cargoVolume} m³
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total cargo space
            </p>
          </div>
        )}
      </div>

      {/* Operating Environment */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Operating Environment</h3>
        <div className="flex items-center space-x-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEnvironmentBadgeColor(specs.operatingEnvironment)}`}
          >
            {specs.operatingEnvironment.charAt(0).toUpperCase() + specs.operatingEnvironment.slice(1)}
          </span>
          <span className="text-sm text-gray-600">
            {specs.operatingEnvironment === 'indoor' && 'Designed for warehouse and indoor operations'}
            {specs.operatingEnvironment === 'outdoor' && 'Built for outdoor and construction environments'}
            {specs.operatingEnvironment === 'mixed' && 'Versatile for both indoor and outdoor use'}
          </span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Special Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${specs.certificationRequired ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">
              Certification Required: {specs.certificationRequired ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${specs.hazmatCapable ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">
              Hazmat Capable: {specs.hazmatCapable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${specs.temperatureControlled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">
              Temperature Controlled: {specs.temperatureControlled ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Compliance Status</h3>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              vehicle.complianceStatus.overallStatus === 'compliant'
                ? 'bg-green-100 text-green-800 border-green-200'
                : vehicle.complianceStatus.overallStatus === 'warning'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}
          >
            {vehicle.complianceStatus.overallStatus.charAt(0).toUpperCase() + vehicle.complianceStatus.overallStatus.slice(1)}
          </span>
          <span className="text-sm text-gray-600">
            {vehicle.complianceStatus.badges.length} active badges, 
            {vehicle.complianceStatus.violations.filter(v => !v.resolvedAt).length} pending violations
          </span>
        </div>
      </div>
    </div>
  );
};