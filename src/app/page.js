'use client';

import { useState, useEffect } from 'react';

export default function TeamViewerConnector() {
  const [myTeamViewerId, setMyTeamViewerId] = useState('');
  const [myPassword, setMyPassword] = useState('');
  const [partnerTeamViewerId, setPartnerTeamViewerId] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [partnerStatus, setPartnerStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'checking', 'connecting', 'connected', 'failed'
  const [teamViewerInstalled, setTeamViewerInstalled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    generateMyTeamViewerCredentials();
    checkTeamViewerInstallation();
  }, []);

  const generateMyTeamViewerCredentials = () => {
    // Simulate getting TeamViewer ID and password from system
    const simulatedId = Math.floor(Math.random() * 900000000) + 100000000;
    const simulatedPassword = Math.random().toString(36).substring(2, 8);
    setMyTeamViewerId(simulatedId.toString());
    setMyPassword(simulatedPassword);
  };

  const checkTeamViewerInstallation = () => {
    // In a real scenario, this would check if TeamViewer is installed
    setTeamViewerInstalled(true);
  };

  const checkPartnerStatus = async (teamViewerId) => {
    if (!teamViewerId || teamViewerId.length < 9) {
      setPartnerStatus('unknown');
      return;
    }

    setPartnerStatus('checking');

    // Simulate API call to check if TeamViewer ID is online
    setTimeout(() => {
      // Simulate random online/offline status
      const isOnline = Math.random() > 0.2; // 80% chance of being online
      setPartnerStatus(isOnline ? 'online' : 'offline');
    }, 1500);
  };

  const connectToPartner = async () => {
    if (partnerStatus !== 'online') {
      alert('Partner is not online. Please check the TeamViewer ID.');
      return;
    }

    if (!partnerPassword.trim()) {
      alert('Please enter the partner&apos;s password to connect.');
      return;
    }

    setConnectionStatus('connecting');

    // Simulate connection attempt with ID and password
    setTimeout(() => {
      // Simulate authentication
      const authSuccess = Math.random() > 0.3; // 70% success rate
      
      if (authSuccess) {
        setConnectionStatus('connected');
        openTeamViewer();
      } else {
        setConnectionStatus('failed');
        alert('Connection failed. Please check the password and try again.');
        setTimeout(() => setConnectionStatus('idle'), 2000);
      }
    }, 3000);
  };

  const openTeamViewer = () => {
    // Try different TeamViewer URL protocols
    const protocols = [
      `teamviewer10://control?device=${partnerTeamViewerId}&password=${partnerPassword}`,
      `teamviewer://control?device=${partnerTeamViewerId}&password=${partnerPassword}`,
      `tv://control?device=${partnerTeamViewerId}&password=${partnerPassword}`
    ];

    let protocolWorked = false;

    // Try each protocol
    protocols.forEach((protocol, index) => {
      setTimeout(() => {
        try {
          const link = document.createElement('a');
          link.href = protocol;
          link.click();
          if (index === 0) protocolWorked = true;
        } catch (error) {
          console.log(`Protocol ${index + 1} failed:`, error);
        }
      }, index * 500);
    });

    // Fallback instructions
    setTimeout(() => {
      if (!protocolWorked) {
        const instructions = `TeamViewer Connection Details:\n\n` +
          `Partner ID: ${partnerTeamViewerId}\n` +
          `Password: ${partnerPassword}\n\n` +
          `If TeamViewer didn&apos;t open automatically:\n` +
          `1. Open TeamViewer manually\n` +
          `2. Enter Partner ID: ${partnerTeamViewerId}\n` +
          `3. Enter Password: ${partnerPassword}\n` +
          `4. Click "Connect to partner"`;
        
        alert(instructions);
      }
      setConnectionStatus('idle');
    }, 2000);
  };

  const disconnect = () => {
    setConnectionStatus('idle');
    setPartnerTeamViewerId('');
    setPartnerPassword('');
    setPartnerStatus('unknown');
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
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected - Opening TeamViewer...';
      case 'failed': return 'Connection Failed';
      default: return 'Connect to Partner';
    }
  };

  const getConnectionButtonColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'connected': return 'bg-green-600 hover:bg-green-700';
      case 'failed': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TeamViewer Connector</h1>
          <p className="text-gray-600">Connect to remote computers using TeamViewer ID and Password</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Credentials */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your TeamViewer Credentials</h2>
            
            {/* TeamViewer Installation Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">TeamViewer Status:</span>
                <span className={`font-semibold ${teamViewerInstalled ? 'text-green-600' : 'text-red-600'}`}>
                  {teamViewerInstalled ? '✅ Installed' : '❌ Not Installed'}
                </span>
              </div>
            </div>

            {/* My TeamViewer ID */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your TeamViewer ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={myTeamViewerId}
                  readOnly
                  className="flex-1 px-4 py-3 text-lg font-mono bg-blue-50 border-2 border-blue-200 rounded-lg text-center"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(myTeamViewerId)}
                  className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            {/* My Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={myPassword}
                  readOnly
                  className="flex-1 px-4 py-3 text-lg font-mono bg-green-50 border-2 border-green-200 rounded-lg text-center"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(myPassword)}
                  className="px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Share these credentials:</h3>
              <p className="text-sm text-blue-800 mb-2">
                <strong>ID:</strong> {myTeamViewerId}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Password:</strong> {showPassword ? myPassword : '••••••'}
              </p>
            </div>
          </div>

          {/* Connect to Partner */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connect to Partner</h2>

            {/* Partner TeamViewer ID */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Partner&apos;s TeamViewer ID
              </label>
              <input
                type="text"
                value={partnerTeamViewerId}
                onChange={handlePartnerIdChange}
                placeholder="Enter 9-digit TeamViewer ID"
                className="w-full px-4 py-3 text-lg font-mono border-2 border-gray-300 rounded-lg text-center focus:border-blue-500 focus:outline-none"
                maxLength="10"
              />
              
              {/* Partner Status */}
              {partnerTeamViewerId.length >= 9 && (
                <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getStatusIcon(partnerStatus)}</span>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-sm font-semibold ${getStatusColor(partnerStatus)}`}>
                    {partnerStatus === 'checking' ? 'Checking...' : 
                     partnerStatus === 'online' ? 'Online' :
                     partnerStatus === 'offline' ? 'Offline' : 'Unknown'}
                  </span>
                </div>
              )}
            </div>

            {/* Partner Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Partner&apos;s Password
              </label>
              <input
                type="password"
                value={partnerPassword}
                onChange={(e) => setPartnerPassword(e.target.value)}
                placeholder="Enter partner's password"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={partnerStatus !== 'online'}
              />
            </div>

            {/* Connection Button */}
            <button
              onClick={connectToPartner}
              disabled={
                !teamViewerInstalled || 
                partnerStatus !== 'online' || 
                connectionStatus === 'connecting' ||
                !partnerPassword.trim() ||
                partnerTeamViewerId.length < 9
              }
              className={`w-full px-6 py-4 text-lg font-semibold text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${getConnectionButtonColor()}`}
            >
              {getConnectionButtonText()}
            </button>

            {connectionStatus === 'connecting' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  🔄 Authenticating with TeamViewer servers...
                </p>
              </div>
            )}

            {connectionStatus === 'connected' && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm text-center">
                    ✅ Connection established! Opening TeamViewer...
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Requirements */}
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Connection Requirements:</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✓ Partner must be online</li>
                <li>✓ Valid 9-digit TeamViewer ID</li>
                <li>✓ Correct password from partner</li>
                <li>✓ TeamViewer installed on your device</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">To allow others to connect to you:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Share your TeamViewer ID and Password</li>
                <li>Ensure TeamViewer is running on your computer</li>
                <li>Wait for incoming connection requests</li>
                <li>Accept the connection when prompted</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">To connect to someone else:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Get their TeamViewer ID and Password</li>
                <li>Enter the ID in the &ldquo;Partner&apos;s ID&rdquo; field</li>
                <li>Enter their password in the password field</li>
                <li>Click &ldquo;Connect to Partner&rdquo;</li>
                <li>TeamViewer will open automatically</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm text-center">
            <strong>Note:</strong> This interface simulates TeamViewer functionality. 
            Real connections require actual TeamViewer IDs and passwords from running TeamViewer instances.
          </p>
        </div>
      </div>
    </div>
  );
}