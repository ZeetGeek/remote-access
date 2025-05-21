'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './context/SocketProvider';
import ConnectionModal from './components/ConnectionModal';

export default function Home() {
  // Socket connection
  const { socket, isConnected } = useSocket();

  // Request number states
  const [myRequestNumber, setMyRequestNumber] = useState('');
  const [targetRequestNumber, setTargetRequestNumber] = useState('');

  // Connection states
  const [connectionStatus, setConnectionStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [requestFrom, setRequestFrom] = useState('');
  const [senderSocketId, setSenderSocketId] = useState('');

  // Generate request number on page load
  useEffect(() => {
    if (isConnected) {
      generateRequestNumber();
    }
  }, [isConnected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for connection requests
    socket.on('connectionRequest', ({ senderNumber, senderSocketId }) => {
      setRequestFrom(senderNumber);
      setSenderSocketId(senderSocketId);
      setShowModal(true);
    });

    // Listen for connection status updates
    socket.on('connectionStatus', ({ accepted, message }) => {
      setConnectionStatus(message);
      setStatusColor(accepted ? 'text-green-600' : 'text-red-600');
    });

    // Listen for request errors
    socket.on('requestError', ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    });

    return () => {
      socket.off('connectionRequest');
      socket.off('connectionStatus');
      socket.off('requestError');
    };
  }, [socket]);

  // Register with socket server when we have a number
  useEffect(() => {
    if (socket && myRequestNumber) {
      socket.emit('register', myRequestNumber);
    }
  }, [socket, myRequestNumber]);

  // Generate a new request number
  const generateRequestNumber = async () => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateNumber' }),
      });

      const data = await response.json();

      if (data.success && data.requestNumber) {
        setMyRequestNumber(data.requestNumber);
        if (socket) {
          socket.emit('register', data.requestNumber);
        }
      }
    } catch (error) {
      console.error('Failed to generate request number:', error);
    }
  };

  // Send connection request
  const sendConnectionRequest = () => {
    if (!socket || !targetRequestNumber || !myRequestNumber) return;

    setErrorMessage('');
    setConnectionStatus('');

    socket.emit('sendConnectionRequest', {
      targetNumber: targetRequestNumber,
      senderNumber: myRequestNumber
    });
  };

  // Handle modal actions
  const handleAccept = () => {
    if (socket && senderSocketId) {
      socket.emit('requestResponse', {
        accepted: true,
        senderSocketId
      });
      setShowModal(false);
    }
  };

  const handleReject = () => {
    if (socket && senderSocketId) {
      socket.emit('requestResponse', {
        accepted: false,
        senderSocketId
      });
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="mb-8 text-2xl font-bold text-center">Remote Desktop Connection App</h1>

        {/* Connection status indicator */}
        <div className="mb-2 text-sm text-right">
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Section 1: Request Number */}
        <section className="p-4 mb-6 border rounded-lg  shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Your Request Number</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md font-mono text-center bg-neutral-900"
              value={myRequestNumber}
              readOnly
            />
            <button
              onClick={generateRequestNumber}
              className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Generate New
            </button>
          </div>
        </section>

        {/* Section 2: Send Connection Request */}
        <section className="p-4 mb-6 border rounded-lg shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Send Connection Request</h2>
          <div className="space-y-3">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md font-mono"
              placeholder="Enter Remote Number"
              value={targetRequestNumber}
              onChange={(e) => setTargetRequestNumber(e.target.value)}
            />

            <button
              onClick={sendConnectionRequest}
              disabled={!isConnected || !targetRequestNumber}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send Request
            </button>

            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        </section>

        {/* Section 3: Connection Status */}
        {connectionStatus && (
          <section className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Connection Status</h2>
            <p className={`text-center ${statusColor}`}>{connectionStatus}</p>
          </section>
        )}
      </div>

      {/* Connection Request Modal */}
      <ConnectionModal
        isOpen={showModal}
        senderNumber={requestFrom}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={handleCloseModal}
      />
    </main>
  );
}