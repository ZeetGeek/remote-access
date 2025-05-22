'use client';

import { useState, useEffect } from 'react';

export default function TeamViewerConnector() {
  const [myTeamViewerId, setMyTeamViewerId] = useState('');
  const [partnerTeamViewerId, setPartnerTeamViewerId] = useState('');
  const [partnerStatus, setPartnerStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'checking', 'sending', 'sent', 'connecting'
  const [teamViewerInstalled, setTeamViewerInstalled] = useState(false);

  useEffect(() => {
    // Simulate getting local TeamViewer ID
    generateMyTeamViewerId();
    checkTeamViewerInstallation();
  }, []);

  const generateMyTeamViewerId = () => {
    // Simulate getting TeamViewer ID from system
    const simulatedId = Math.floor(Math.random() * 900000000) + 100000000;
    setMyTeamViewerId(simulatedId.toString());
  };

  const checkTeamViewerInstallation = () => {
    // In a real scenario, this would check if TeamViewer is installed
    // For demo, we'll simulate it's installed
    setTeamViewerInstalled(true);
  };

  const checkPartnerStatus = async (teamViewerId) => {
    if (!teamViewerId || teamViewerId.length < 9) {
      setPartnerStatus('unknown');
      return;
    }

    setConnectionStatus('checking');
    setPartnerStatus('checking');

    // Simulate API call to check if TeamViewer ID is online
    setTimeout(() => {
      // Simulate random online/offline status
      const isOnline = Math.random() > 0.3; // 70% chance of being online
      setPartnerStatus(isOnline ? 'online' : 'offline');
      setConnectionStatus('idle');
    }, 2000);
  };

  const sendConnectionRequest = async () => {
    if (partnerStatus !== 'online') {
      alert('Partner is not online or TeamViewer ID is invalid');
      return;
    }

    setConnectionStatus('sending');

    // Simulate sending connection request
    setTimeout(() => {
      setConnectionStatus('sent');
      
      // Simulate response after 3 seconds
      setTimeout(() => {
        const accepted = Math.random() > 0.4; // 60% chance of acceptance
        
        if (accepted) {
          setConnectionStatus('connecting');
          openTeamViewer();
        } else {
          setConnectionStatus('idle');
          alert('Connection request was declined by the partner');
        }
      }, 3000);
    }, 1500);
  };

  const openTeamViewer = () => {
    // Attempt to open TeamViewer with the partner ID
    const teamViewerUrl = `teamviewer10://control?device=${partnerTeamViewerId}`;
    
    try {
      // Try to open TeamViewer protocol
      window.location.href = teamViewerUrl;
      
      // Fallback: provide manual instructions
      setTimeout(() => {
        alert(`Opening TeamViewer...\n\nIf TeamViewer doesn't open automatically:\n1. Open TeamViewer manually\n2. Enter Partner ID: ${partnerTeamViewerId}\n3. Click "Connect to partner"`);
        setConnectionStatus('idle');
      }, 2000);
    } catch (error) {
      // Fallback for browsers that don't support custom protocols
      alert(`Please open TeamViewer manually and connect to ID: ${partnerTeamViewerId}`);
      setConnectionStatus('idle');
    }
  };

  const handlePartnerIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    setPartnerTeamViewerId(value);
    
    if (value.length >= 9) {
      checkPartnerStatus(value);
    } else {
      setPartnerStatus('unknown');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'checking': return 'Checking Status...';
      case 'sending': return 'Sending Request...';
      case 'sent': return 'Request Sent - Waiting...';
      case 'connecting': return 'Opening TeamViewer...';
      default: return 'Send Connection Request';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TeamViewer Connector</h1>
          <p className="text-gray-600">Connect to remote computers using TeamViewer IDs</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* TeamViewer Installation Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">TeamViewer Status:</span>
              <span className={`font-semibold ${teamViewerInstalled ? 'text-green-600' : 'text-red-600'}`}>
                {teamViewerInstalled ? '✅ Installed' : '❌ Not Installed'}
              </span>
            </div>
            {!teamViewerInstalled && (
              <p className="text-sm text-red-600 mt-2">
                Please install TeamViewer to use this connector.
              </p>
            )}
          </div>

          {/* My TeamViewer ID */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Your TeamViewer ID
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={myTeamViewerId}
                readOnly
                className="flex-1 px-4 py-3 text-xl font-mono bg-blue-50 border-2 border-blue-200 rounded-lg text-center"
              />
              <button
                onClick={() => navigator.clipboard.writeText(myTeamViewerId)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this ID with someone who wants to connect to your computer
            </p>
          </div>

          {/* Partner TeamViewer ID */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Partner&apos;s TeamViewer ID
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={partnerTeamViewerId}
                onChange={handlePartnerIdChange}
                placeholder="Enter 9-digit TeamViewer ID (e.g., 123 456 789)"
                className="w-full px-4 py-3 text-xl font-mono border-2 border-gray-300 rounded-lg text-center focus:border-blue-500 focus:outline-none"
                maxLength="10"
              />
              
              {/* Partner Status */}
              {partnerTeamViewerId.length >= 9 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getStatusIcon(partnerStatus)}</span>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`font-semibold ${getStatusColor(partnerStatus)}`}>
                    {partnerStatus === 'checking' ? 'Checking...' : 
                     partnerStatus === 'online' ? 'Online' :
                     partnerStatus === 'offline' ? 'Offline' : 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Connection Button */}
          <div className="mb-6">
            <button
              onClick={sendConnectionRequest}
              disabled={
                !teamViewerInstalled || 
                partnerStatus !== 'online' || 
                connectionStatus !== 'idle' ||
                partnerTeamViewerId.length < 9
              }
              className="w-full px-6 py-4 text-lg font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {getConnectionButtonText()}
            </button>
            
            {connectionStatus === 'sent' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  ⏳ Waiting for partner to accept the connection request...
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enter the 9-digit TeamViewer ID of the computer you want to connect to</li>
              <li>The system will check if that computer is online</li>
              <li>If online, click &ldquo;Send Connection Request&rdquo; to request access</li>
              <li>Wait for the partner to accept your request</li>
              <li>TeamViewer will open automatically when the connection is established</li>
            </ol>
          </div>

          {/* Demo Notice */}
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 text-sm">
              <strong>Demo Mode:</strong> This is a simulation. Real TeamViewer integration requires official API access and proper authentication.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold mb-1">Status Check</h3>
            <p className="text-sm text-gray-600">Real-time online/offline detection</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl mb-2">📨</div>
            <h3 className="font-semibold mb-1">Request System</h3>
            <p className="text-sm text-gray-600">Send connection requests securely</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold mb-1">Auto Launch</h3>
            <p className="text-sm text-gray-600">Opens TeamViewer automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}