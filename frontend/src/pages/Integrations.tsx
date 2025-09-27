import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { 
  CloudIcon, 
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  LinkIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'erp' | 'telematics' | 'payment' | 'analytics' | 'maintenance' | 'other';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  lastSync?: Date;
  apiEndpoint?: string;
  isConfigured: boolean;
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'sap-erp',
      name: 'SAP ERP',
      description: 'Enterprise Resource Planning integration for fleet management',
      category: 'erp',
      status: 'connected',
      icon: 'grid',
      lastSync: new Date(),
      apiEndpoint: 'https://api.sap.com/fleet',
      isConfigured: true
    },
    {
      id: 'tally-accounting',
      name: 'Tally Accounting',
      description: 'Financial management and accounting integration',
      category: 'erp',
      status: 'connected',
      icon: 'chart',
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      apiEndpoint: 'https://api.tally.com/v1',
      isConfigured: true
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Payment gateway for charging and billing',
      category: 'payment',
      status: 'connected',
      icon: 'dollar',
      lastSync: new Date(Date.now() - 600000), // 10 minutes ago
      apiEndpoint: 'https://api.razorpay.com/v1',
      isConfigured: true
    },
    {
      id: 'paytm',
      name: 'Paytm Business',
      description: 'Digital payments and wallet integration',
      category: 'payment',
      status: 'disconnected',
      icon: 'grid',
      isConfigured: false
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Fleet performance and usage analytics',
      category: 'analytics',
      status: 'connected',
      icon: 'trending',
      lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
      apiEndpoint: 'https://analytics.google.com/api',
      isConfigured: true
    },
    {
      id: 'microsoft-power-bi',
      name: 'Microsoft Power BI',
      description: 'Business intelligence and reporting platform',
      category: 'analytics',
      status: 'error',
      icon: 'chart',
      apiEndpoint: 'https://api.powerbi.com/v1.0',
      isConfigured: true
    },
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      description: 'IoT device management and data collection',
      category: 'telematics',
      status: 'connected',
      icon: 'grid',
      lastSync: new Date(Date.now() - 60000), // 1 minute ago
      apiEndpoint: 'https://iot.amazonaws.com',
      isConfigured: true
    },
    {
      id: 'azure-iot',
      name: 'Azure IoT Hub',
      description: 'Microsoft Azure IoT platform integration',
      category: 'telematics',
      status: 'pending',
      icon: 'shield',
      apiEndpoint: 'https://azure.microsoft.com/iot',
      isConfigured: false
    },
    {
      id: 'servicenow',
      name: 'ServiceNow',
      description: 'IT service management and maintenance workflows',
      category: 'maintenance',
      status: 'disconnected',
      icon: 'tools',
      isConfigured: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and alert notifications',
      category: 'other',
      status: 'connected',
      icon: 'users',
      lastSync: new Date(Date.now() - 120000), // 2 minutes ago
      apiEndpoint: 'https://slack.com/api',
      isConfigured: true
    }
  ]);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configData, setConfigData] = useState({
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    webhookUrl: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories', count: integrations.length },
    { value: 'erp', label: 'ERP Systems', count: integrations.filter(i => i.category === 'erp').length },
    { value: 'payment', label: 'Payment Gateways', count: integrations.filter(i => i.category === 'payment').length },
    { value: 'analytics', label: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { value: 'telematics', label: 'Telematics', count: integrations.filter(i => i.category === 'telematics').length },
    { value: 'maintenance', label: 'Maintenance', count: integrations.filter(i => i.category === 'maintenance').length },
    { value: 'other', label: 'Other', count: integrations.filter(i => i.category === 'other').length }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <CloudIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pending';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigData({
      apiKey: '',
      apiSecret: '',
      endpoint: integration.apiEndpoint || '',
      webhookUrl: ''
    });
    setShowConfigModal(true);
  };

  const handleConnect = (integration: Integration) => {
    setIntegrations(integrations.map(i => 
      i.id === integration.id 
        ? { ...i, status: 'connected', lastSync: new Date(), isConfigured: true }
        : i
    ));
  };

  const handleDisconnect = (integration: Integration) => {
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      setIntegrations(integrations.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'disconnected', lastSync: undefined }
          : i
      ));
    }
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      setIntegrations(integrations.map(i => 
        i.id === selectedIntegration.id 
          ? { 
              ...i, 
              status: 'connected', 
              lastSync: new Date(), 
              isConfigured: true,
              apiEndpoint: configData.endpoint 
            }
          : i
      ));
      setShowConfigModal(false);
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect FleetVolt Pro with your existing systems and services</p>
        </div>
        <Button
          variant="primary"
          leftIcon={PlusIcon}
          onClick={() => {/* Add custom integration */}}
        >
          Add Custom Integration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CloudIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="text-3xl mr-3"><Icon name={integration.icon} className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                    {getStatusText(integration.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Last sync: {formatLastSync(integration.lastSync)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                {integration.status === 'connected' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Cog6ToothIcon}
                      onClick={() => handleConfigure(integration)}
                      className="flex-1"
                    >
                      Configure
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisconnect(integration)}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : integration.status === 'error' ? (
                  <>
                    <Button
                      variant="warning"
                      size="sm"
                      leftIcon={Cog6ToothIcon}
                      onClick={() => handleConfigure(integration)}
                      className="flex-1"
                    >
                      Fix Configuration
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(integration)}
                      className="flex-1"
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => integration.isConfigured ? handleConnect(integration) : handleConfigure(integration)}
                    className="w-full"
                  >
                    {integration.isConfigured ? 'Connect' : 'Setup & Connect'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={`Configure ${selectedIntegration?.name}`}
        size="lg"
      >
        {selectedIntegration && (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mr-3"><Icon name={selectedIntegration.icon} className="w-6 h-6" /></div>
              <div>
                <h3 className="font-semibold text-blue-900">{selectedIntegration.name}</h3>
                <p className="text-sm text-blue-700">{selectedIntegration.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <Input
                type="password"
                value={configData.apiKey}
                onChange={(e) => setConfigData({ ...configData, apiKey: e.target.value })}
                placeholder="Enter your API key"
                leftIcon={KeyIcon}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <Input
                type="password"
                value={configData.apiSecret}
                onChange={(e) => setConfigData({ ...configData, apiSecret: e.target.value })}
                placeholder="Enter your API secret"
                leftIcon={KeyIcon}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <Input
                type="url"
                value={configData.endpoint}
                onChange={(e) => setConfigData({ ...configData, endpoint: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL (Optional)
              </label>
              <Input
                type="url"
                value={configData.webhookUrl}
                onChange={(e) => setConfigData({ ...configData, webhookUrl: e.target.value })}
                placeholder="https://your-webhook-url.com/callback"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your API credentials are encrypted and stored securely. They are only used to authenticate with the selected service.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveConfig}
                disabled={!configData.apiKey || !configData.endpoint}
              >
                Save & Connect
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Integrations;