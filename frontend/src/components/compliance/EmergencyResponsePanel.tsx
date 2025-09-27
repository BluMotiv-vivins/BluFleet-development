import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface EmergencyResponsePanelProps {
  onEmergencyResponse: (type: string) => void;
}

export const EmergencyResponsePanel: React.FC<EmergencyResponsePanelProps> = ({ 
  onEmergencyResponse 
}) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState(false);

  const emergencyTypes = [
    {
      type: 'fire',
      title: 'Fire Emergency',
      description: 'Vehicle fire, charging station fire, or facility fire',
      color: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 4-4 5 0 8 2.5 8 6.5 0 4.5-2.5 8.5-8.5 8.5z" />
        </svg>
      ),
    },
    {
      type: 'medical',
      title: 'Medical Emergency',
      description: 'Driver injury, medical incident, or health emergency',
      color: 'bg-red-500 hover:bg-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      type: 'security',
      title: 'Security Breach',
      description: 'Unauthorized access, theft, or security incident',
      color: 'bg-orange-600 hover:bg-orange-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      type: 'environmental',
      title: 'Environmental Hazard',
      description: 'Chemical spill, hazardous material leak, or environmental threat',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      type: 'mechanical',
      title: 'Mechanical Failure',
      description: 'Critical vehicle breakdown, charging system failure, or equipment malfunction',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      type: 'accident',
      title: 'Vehicle Accident',
      description: 'Traffic accident, collision, or vehicle incident',
      color: 'bg-red-700 hover:bg-red-800',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const handleEmergencyClick = (type: string) => {
    setSelectedEmergency(type);
    setConfirmationModal(true);
  };

  const handleConfirmEmergency = () => {
    if (selectedEmergency) {
      onEmergencyResponse(selectedEmergency);
      setConfirmationModal(false);
      setSelectedEmergency(null);
    }
  };

  const getEmergencyDetails = (type: string) => {
    return emergencyTypes.find(e => e.type === type);
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-sm font-medium text-red-800">
            Emergency Response Protocol
          </h3>
        </div>
        <p className="mt-2 text-sm text-red-700">
          Use these buttons only for genuine emergencies. All emergency responses are logged and will trigger immediate notifications to relevant personnel and authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencyTypes.map((emergency) => (
          <button
            key={emergency.type}
            onClick={() => handleEmergencyClick(emergency.type)}
            className={`${emergency.color} text-white p-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            <div className="flex items-center justify-center mb-3">
              {emergency.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {emergency.title}
            </h3>
            <p className="text-sm opacity-90">
              {emergency.description}
            </p>
          </button>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Emergency Services', number: '911', description: 'Fire, Police, Medical' },
            { title: 'Fleet Operations Center', number: '(555) 123-4567', description: '24/7 Operations Support' },
            { title: 'Safety Manager', number: '(555) 234-5678', description: 'Safety Incidents & Compliance' },
            { title: 'Environmental Response', number: '(555) 345-6789', description: 'Hazmat & Environmental Issues' },
          ].map((contact, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">{contact.title}</h4>
              <p className="text-lg font-mono text-blue-600 my-1">{contact.number}</p>
              <p className="text-sm text-gray-600">{contact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Emergency Responses */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Emergency Responses
        </h3>
        <div className="space-y-3">
          {[
            {
              type: 'mechanical',
              description: 'Vehicle EV-001 charging system failure',
              timestamp: '2024-12-13 14:30',
              status: 'Resolved',
            },
            {
              type: 'security',
              description: 'Unauthorized access attempt at Warehouse B',
              timestamp: '2024-12-12 22:15',
              status: 'Under Investigation',
            },
          ].map((response, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getEmergencyDetails(response.type)?.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{response.description}</p>
                  <p className="text-sm text-gray-600">{response.timestamp}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  response.status === 'Resolved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {response.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        title="Confirm Emergency Response"
        size="md"
      >
        <div className="space-y-4">
          {selectedEmergency && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-sm font-medium text-red-800">
                    {getEmergencyDetails(selectedEmergency)?.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  {getEmergencyDetails(selectedEmergency)?.description}
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                This will immediately notify emergency responders and relevant personnel. 
                Are you sure you want to proceed with this emergency response?
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmEmergency}
                >
                  Confirm Emergency
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};