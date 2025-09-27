import React, { useState } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

interface AddVehicleModalProps {
  onClose: () => void;
  onAdd: (vehicleData: any) => void;
}

interface VehicleFormData {
  vin_number: string;
  make: string;
  model: string;
  year: number;
  battery_capacity_kwh: number;
  max_charging_power_kw: number;
  vehicle_type: string;
  status: string;
  assigned_driver_id?: string;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    vin_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    battery_capacity_kwh: 0,
    max_charging_power_kw: 0,
    vehicle_type: 'sedan',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vin_number.trim()) {
      newErrors.vin_number = 'VIN number is required';
    } else if (formData.vin_number.length !== 17) {
      newErrors.vin_number = 'VIN number must be 17 characters';
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.year || formData.year < 2000 || formData.year > new Date().getFullYear() + 2) {
      newErrors.year = 'Please enter a valid year';
    }

    if (!formData.battery_capacity_kwh || formData.battery_capacity_kwh <= 0) {
      newErrors.battery_capacity_kwh = 'Battery capacity must be greater than 0';
    }

    if (!formData.max_charging_power_kw || formData.max_charging_power_kw <= 0) {
      newErrors.max_charging_power_kw = 'Max charging power must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onAdd(formData);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const generateRandomVIN = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // Excludes I, O, Q
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars[Math.floor(Math.random() * chars.length)];
    }
    handleInputChange('vin_number', vin);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Icon name="plus-circle" className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add New Vehicle
              </h3>
            </div>
            <Button variant="outline" onClick={onClose}>
              <Icon name="x" className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* VIN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VIN Number *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.vin_number}
                  onChange={(e) => handleInputChange('vin_number', e.target.value.toUpperCase())}
                  placeholder="17-character VIN"
                  maxLength={17}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.vin_number 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomVIN}
                  className="whitespace-nowrap"
                >
                  <Icon name="shuffle" className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
              {errors.vin_number && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vin_number}</p>
              )}
            </div>

            {/* Make and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make *
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Tesla, BMW, Nissan"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.make 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.make}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Model 3, i3, Leaf"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.model 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model}</p>
                )}
              </div>
            </div>

            {/* Year and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min={2000}
                  max={new Date().getFullYear() + 2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.year 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
            </div>

            {/* Battery Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Battery Capacity (kWh) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.battery_capacity_kwh}
                  onChange={(e) => handleInputChange('battery_capacity_kwh', parseFloat(e.target.value))}
                  placeholder="e.g., 75.0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.battery_capacity_kwh 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.battery_capacity_kwh && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.battery_capacity_kwh}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Charging Power (kW) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.max_charging_power_kw}
                  onChange={(e) => handleInputChange('max_charging_power_kw', parseFloat(e.target.value))}
                  placeholder="e.g., 150.0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.max_charging_power_kw 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.max_charging_power_kw && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_charging_power_kw}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Common EV Presets */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Presets</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      make: 'Tesla',
                      model: 'Model 3',
                      year: 2024,
                      battery_capacity_kwh: 75.0,
                      max_charging_power_kw: 250.0,
                      vehicle_type: 'sedan'
                    }));
                  }}
                  className="text-xs"
                >
                  Tesla Model 3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      make: 'BMW',
                      model: 'iX',
                      year: 2024,
                      battery_capacity_kwh: 105.2,
                      max_charging_power_kw: 200.0,
                      vehicle_type: 'suv'
                    }));
                  }}
                  className="text-xs"
                >
                  BMW iX
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      make: 'Nissan',
                      model: 'Leaf',
                      year: 2024,
                      battery_capacity_kwh: 60.0,
                      max_charging_power_kw: 46.0,
                      vehicle_type: 'sedan'
                    }));
                  }}
                  className="text-xs"
                >
                  Nissan Leaf
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
