'use client';

import { useState, useEffect } from 'react';

export default function RemoteControl() {
  const [selectedService, setSelectedService] = useState('chrome-remote');
  const [deviceId, setDeviceId] = useState('');
  const [connectionCode, setConnectionCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const remoteServices = [
    {
      id: 'chrome-remote',
      name: 'Chrome Remote Desktop',
      icon: '🌐',
      description: 'Google\'s free remote desktop solution',
      url: 'https://remotedesktop.google.com/access',
      webClient: true,
      requiresInstall: true,
      platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS']
    },
    {
      id: 'anydesk',
      name: 'AnyDesk',
      icon: '🖥️',
      description: 'Professional remote desktop software',
      url: 'https://anydesk.com/en/downloads',
      webClient: false,
      requiresInstall: true,
      platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS']
    },
    {
      id: 'teamviewer',
      name: 'TeamViewer',
      icon: '🔗',
      description: 'World\'s most popular remote access solution',
      url: 'https://www.teamviewer.com/en/download/',
      webClient: true,
      requiresInstall: true,
      platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS']
    },
    {
      id: 'windows-rdp',
      name: 'Windows RDP',
      icon: '🪟',
      description: 'Built-in Windows Remote Desktop',
      url: 'ms-rd:',
      webClient: false,
      requiresInstall: false,
      platforms: ['Windows']
    },
    {
      id: 'vnc-viewer',
      name: 'VNC Viewer',
      icon: '📺',
      description: 'Cross-platform remote access',
      url: 'https://www.realvnc.com/en/connect/download/viewer/',
      webClient: false,
      requiresInstall: true,
      platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS']
    }
  ];

  const currentService = remoteServices.find(service => service.id === selectedService);

  const connectToChromeRemote = () => {
    setIsConnecting(true);
    
    // Open Chrome Remote Desktop in new tab
    window.open('https://remotedesktop.google.com/access', '_blank');
    
    setTimeout(() => {
      setIsConnecting(false);
      alert('Chrome Remote Desktop opened in a new tab. Sign in with your Google account to access your devices.');
    }, 2000);
  };

  const connectToAnyDesk = () => {
    if (!deviceId.trim()) {
      alert('Please enter an AnyDesk ID');
      return;
    }

    setIsConnecting(true);

    // Try to open AnyDesk with the device ID
    const anydeskUrl = `anydesk:${deviceId}`;
    
    try {
      window.location.href = anydeskUrl;
      
      setTimeout(() => {
        setIsConnecting(false);
        const fallback = confirm(
          `AnyDesk should open automatically.\n\n` +
          `If it didn't open:\n` +
          `1. Download AnyDesk from anydesk.com\n` +
          `2. Install and run AnyDesk\n` +
          `3. Enter ID: ${deviceId}\n` +
          `4. Click Connect\n\n` +
          `Download AnyDesk now?`
        );
        
        if (fallback) {
          window.open('https://anydesk.com/en/downloads', '_blank');
        }
      }, 2000);
    } catch (error) {
      setIsConnecting(false);
      const download = confirm(
        `AnyDesk is not installed.\n\n` +
        `Download and install AnyDesk to connect to ID: ${deviceId}?`
      );
      
      if (download) {
        window.open('https://anydesk.com/en/downloads', '_blank');
      }
    }
  };

  const connectToTeamViewer = () => {
    if (!deviceId.trim()) {
      alert('Please enter a TeamViewer ID');
      return;
    }

    setIsConnecting(true);

    // Try TeamViewer web client first
    const teamviewerWebUrl = `https://web.teamviewer.com/connect/${deviceId}`;
    
    // Also try desktop client
    const teamviewerUrl = `teamviewer10://control?device=${deviceId}`;
    
    try {
      // Try desktop client first
      window.location.href = teamviewerUrl;
      
      setTimeout(() => {
        // Fallback to web client
        window.open(teamviewerWebUrl, '_blank');
        setIsConnecting(false);
        
        alert(
          `TeamViewer connection initiated!\n\n` +
          `Desktop app should open, or check the new tab for web client.\n` +
          `Enter the password when prompted.`
        );
      }, 2000);
    } catch (error) {
      // Open web client as fallback
      window.open(teamviewerWebUrl, '_blank');
      setIsConnecting(false);
    }
  };

  const connectToWindowsRDP = () => {
    if (!deviceId.trim()) {
      alert('Please enter computer name or IP address');
      return;
    }

    setIsConnecting(true);

    const rdpUrl = `ms-rd:screenresolution=1920x1080&username=&domain=&workspaceid=&host=${deviceId}`;
    
    try {
      window.location.href = rdpUrl;
      
      setTimeout(() => {
        setIsConnecting(false);
        alert(
          `Windows Remote Desktop should open.\n\n` +
          `If it doesn't work:\n` +
          `1. Open "Remote Desktop Connection" from Start menu\n` +
          `2. Enter computer: ${deviceId}\n` +
          `3. Click Connect and enter credentials`
        );
      }, 2000);
    } catch (error) {
      setIsConnecting(false);
      alert(
        `Please use Windows Remote Desktop Connection manually:\n\n` +
        `1. Search "Remote Desktop Connection" in Start menu\n` +
        `2. Enter computer: ${deviceId}\n` +
        `3. Click Connect`
      );
    }
  };

  const connectToVNC = () => {
    if (!deviceId.trim()) {
      alert('Please enter VNC server address (IP:port)');
      return;
    }

    setIsConnecting(true);

    const vncUrl = `vnc://${deviceId}`;
    
    try {
      window.location.href = vncUrl;
      
      setTimeout(() => {
        setIsConnecting(false);
        const download = confirm(
          `VNC Viewer should open.\n\n` +
          `If not installed, download VNC Viewer?`
        );
        
        if (download) {
          window.open('https://www.realvnc.com/en/connect/download/viewer/', '_blank');
        }
      }, 2000);
    } catch (error) {
      setIsConnecting(false);
      const download = confirm(
        `VNC Viewer not found.\n\n` +
        `Download VNC Viewer to connect to: ${deviceId}?`
      );
      
      if (download) {
        window.open('https://www.realvnc.com/en/connect/download/viewer/', '_blank');
      }
    }
  };

  const handleConnect = () => {
    switch (selectedService) {
      case 'chrome-remote':
        connectToChromeRemote();
        break;
      case 'anydesk':
        connectToAnyDesk();
        break;
      case 'teamviewer':
        connectToTeamViewer();
        break;
      case 'windows-rdp':
        connectToWindowsRDP();
        break;
      case 'vnc-viewer':
        connectToVNC();
        break;
      default:
        alert('Please select a remote desktop service');
    }
  };

  const quickConnect = (serviceId, id) => {
    setSelectedService(serviceId);
    setDeviceId(id);
    setTimeout(() => handleConnect(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Remote Control Center
          </h1>
          <p className="text-gray-600">
            Connect to any computer using popular remote desktop solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Choose Remote Service
              </h2>
              
              <div className="space-y-3">
                {remoteServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{currentService?.icon}</span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {currentService?.name}
                  </h2>
                  <p className="text-gray-600">{currentService?.description}</p>
                </div>
              </div>

              {/* Connection Form */}
              {selectedService !== 'chrome-remote' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedService === 'teamviewer' ? 'TeamViewer ID' :
                     selectedService === 'anydesk' ? 'AnyDesk ID' :
                     selectedService === 'windows-rdp' ? 'Computer Name/IP' :
                     selectedService === 'vnc-viewer' ? 'VNC Server (IP:Port)' : 'Device ID'}
                  </label>
                  <input
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder={
                      selectedService === 'teamviewer' ? 'Enter 9-digit TeamViewer ID' :
                      selectedService === 'anydesk' ? 'Enter AnyDesk ID' :
                      selectedService === 'windows-rdp' ? 'computer-name or 192.168.1.100' :
                      selectedService === 'vnc-viewer' ? '192.168.1.100:5900' : 'Enter device identifier'
                    }
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={isConnecting || (selectedService !== 'chrome-remote' && !deviceId.trim())}
                className={`w-full px-6 py-4 text-lg font-semibold rounded-lg transition-colors ${
                  isConnecting
                    ? 'bg-yellow-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {isConnecting ? '🔄 Connecting...' : `🚀 Connect with ${currentService?.name}`}
              </button>

              {/* Service Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Requirements:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentService?.requiresInstall && (
                    <li>• {currentService.name} must be installed on both devices</li>
                  )}
                  {currentService?.webClient && (
                    <li>• Web client available (will open in browser)</li>
                  )}
                  <li>• Target computer must be online and accessible</li>
                  <li>• Proper permissions/credentials required</li>
                </ul>
              </div>

              {/* Quick Examples */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Test Examples:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedService === 'teamviewer' && (
                    <>
                      <button
                        onClick={() => quickConnect('teamviewer', '123456789')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Test: 123456789
                      </button>
                    </>
                  )}
                  {selectedService === 'anydesk' && (
                    <>
                      <button
                        onClick={() => quickConnect('anydesk', '123456789')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Test: 123456789
                      </button>
                    </>
                  )}
                  {selectedService === 'windows-rdp' && (
                    <>
                      <button
                        onClick={() => quickConnect('windows-rdp', 'localhost')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Test: localhost
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Supported Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">🖱️</div>
              <h3 className="font-semibold mb-1">Full Control</h3>
              <p className="text-sm text-gray-600">Mouse & keyboard control</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📂</div>
              <h3 className="font-semibold mb-1">File Transfer</h3>
              <p className="text-sm text-gray-600">Copy files between devices</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🔊</div>
              <h3 className="font-semibold mb-1">Audio Support</h3>
              <p className="text-sm text-gray-600">Hear remote audio</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">Multi-Platform</h3>
              <p className="text-sm text-gray-600">Works across devices</p>
            </div>
          </div>
        </div>

        {/* Download Links */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Download Links:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {remoteServices.map((service) => (
              <a
                key={service.id}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white text-sm text-center rounded hover:bg-gray-50 transition-colors"
              >
                {service.icon} {service.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}