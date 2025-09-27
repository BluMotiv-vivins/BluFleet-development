import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const AnalyticsReports: React.FC = () => {
  const { vehicles } = useSelector((state: RootState) => state.fleet);
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const [selectedReport, setSelectedReport] = useState('fleet-performance');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportTypes = [
    { value: 'fleet-performance', label: 'Fleet Performance Report' },
    { value: 'cost-analysis', label: 'Cost Analysis Report' },
    { value: 'battery-health', label: 'Battery Health Report' },
    { value: 'driver-performance', label: 'Driver Performance Report' },
    { value: 'maintenance', label: 'Maintenance Report' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'energy-usage', label: 'Energy Usage Report' },
    { value: 'route-optimization', label: 'Route Optimization Report' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
    { value: 'json', label: 'JSON Data' }
  ];

  const generateMockData = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

    return {
      fleetPerformance: {
        totalVehicles,
        activeVehicles,
        utilizationRate: ((activeVehicles / totalVehicles) * 100).toFixed(1),
        avgBatteryLevel: vehicles.reduce((sum, v) => sum + v.battery.currentLevel, 0) / totalVehicles,
        totalDistance: Math.floor(Math.random() * 50000) + 25000,
        energyConsumed: Math.floor(Math.random() * 15000) + 8000,
        costSavings: Math.floor(Math.random() * 200000) + 150000
      },
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts,
        resolved: Math.floor(totalAlerts * 0.7),
        pending: Math.floor(totalAlerts * 0.3)
      }
    };
  };

  const mockData = generateMockData();

  const handleExport = () => {
    // Simulate export functionality
    console.log(`Exporting ${selectedReport} as ${exportFormat} for ${dateRange}`);
    setShowExportModal(false);
    // In a real app, this would trigger the actual export
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Simulate share functionality
    if (navigator.share) {
      navigator.share({
        title: 'FleetVolt Pro Analytics Report',
        text: `${reportTypes.find(r => r.value === selectedReport)?.label} - ${dateRange}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate comprehensive reports and analytics for your fleet</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            leftIcon={PrinterIcon}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outline"
            leftIcon={ShareIcon}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            variant="primary"
            leftIcon={DocumentArrowDownIcon}
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <Dropdown
              options={reportTypes}
              value={selectedReport}
              onSelect={setSelectedReport}
              placeholder="Select report type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Dropdown
              options={dateRanges}
              value={dateRange}
              onSelect={setDateRange}
              placeholder="Select date range"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              leftIcon={ChartBarIcon}
              className="w-full"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {reportTypes.find(r => r.value === selectedReport)?.label}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Report generated for {dateRanges.find(r => r.value === dateRange)?.label}
          </p>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockData.fleetPerformance.totalVehicles}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">%</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Utilization Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{mockData.fleetPerformance.utilizationRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-600 dark:bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">₹</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Cost Savings</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">₹{mockData.fleetPerformance.costSavings.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{mockData.alerts.critical}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Performance Chart */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Fleet Performance Trends</h3>
              <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Performance Chart</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Interactive charts will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Energy Costs</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{(mockData.fleetPerformance.energyConsumed * 8).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{Math.floor(mockData.fleetPerformance.costSavings * 0.3).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{Math.floor(mockData.fleetPerformance.costSavings * 0.2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Operations</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{Math.floor(mockData.fleetPerformance.costSavings * 0.15).toLocaleString('en-IN')}</span>
                </div>
                <hr className="dark:border-gray-600" />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-gray-900 dark:text-gray-100">Total Savings</span>
                  <span className="text-green-600 dark:text-green-400">₹{mockData.fleetPerformance.costSavings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detailed Vehicle Performance</h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl">
                <thead className="bg-gray-50 dark:bg-gray-700 rounded-t-xl">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Battery Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Distance (km)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost Savings (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {vehicles.slice(0, 10).map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {vehicle.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          vehicle.status === 'charging' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {vehicle.battery.currentLevel}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {Math.floor(Math.random() * 500) + 100}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ₹{(Math.floor(Math.random() * 5000) + 2000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Report"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <Dropdown
              options={exportFormats}
              value={exportFormat}
              onSelect={setExportFormat}
              placeholder="Select format"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Name
            </label>
            <Input
              type="text"
              value={`${selectedReport}-${dateRange}-${new Date().toISOString().split('T')[0]}`}
              placeholder="Enter file name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyticsReports;