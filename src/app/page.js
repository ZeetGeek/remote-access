'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './context/SocketProvider';
import ConnectionModal from './components/ConnectionModal';
import RemoteControl from './components/RemoteControl';
import RemoteCursor from './components/RemoteCursor';

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

    // Remote control states
    const [isController, setIsController] = useState(false);
    const [isBeingControlled, setIsBeingControlled] = useState(false);
    const [connectedTo, setConnectedTo] = useState(null);

    // Random color status
    const [color, setColor] = useState('#ffffff');

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
        const handleConnectionRequest = ({ senderNumber, senderSocketId }) => {
            console.log('Received connection request from:', senderNumber);
            setRequestFrom(senderNumber);
            setSenderSocketId(senderSocketId);
            setShowModal(true);
        };

        // Listen for connection status updates
        const handleConnectionStatus = ({ accepted, message, connectedTo, isController }) => {
            console.log('Connection status update:', {
                accepted,
                message,
                connectedTo,
                isController,
            });
            setConnectionStatus(message);
            setStatusColor(accepted ? 'text-green-600' : 'text-red-600');

            if (accepted && connectedTo) {
                console.log(
                    'Setting connection state:',
                    isController ? 'Controller' : 'Being controlled'
                );
                if (isController === true) {
                    setIsController(true);
                    setIsBeingControlled(false);
                } else if (isController === false) {
                    setIsController(false);
                    setIsBeingControlled(true);
                }
                setConnectedTo(connectedTo);
            }
        };

        // Listen for prepare for remote control (for the person being controlled)
        const handlePrepareForRemoteControl = ({ connectedTo }) => {
            console.log('Preparing for remote control, connected to:', connectedTo);
            setIsBeingControlled(true);
            setIsController(false);
            setConnectedTo(connectedTo);
        };

        // Listen for connection closed
        const handleConnectionClosed = () => {
            console.log('Connection closed');
            setIsController(false);
            setIsBeingControlled(false);
            setConnectedTo(null);
            setConnectionStatus('Connection closed');
            setStatusColor('text-gray-600');
        };

        // Listen for request errors
        const handleRequestError = ({ message }) => {
            console.error('Request error:', message);
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 5000);
        };

        // Add all event listeners
        socket.on('connectionRequest', handleConnectionRequest);
        socket.on('connectionStatus', handleConnectionStatus);
        socket.on('prepareForRemoteControl', handlePrepareForRemoteControl);
        socket.on('connectionClosed', handleConnectionClosed);
        socket.on('requestError', handleRequestError);

        // Log initial connection
        console.log('Socket initialized, ID:', socket.id);

        return () => {
            // Remove all event listeners
            socket.off('connectionRequest', handleConnectionRequest);
            socket.off('connectionStatus', handleConnectionStatus);
            socket.off('prepareForRemoteControl', handlePrepareForRemoteControl);
            socket.off('connectionClosed', handleConnectionClosed);
            socket.off('requestError', handleRequestError);
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
        setIsController(false);
        setIsBeingControlled(false);
        setConnectedTo(null);

        socket.emit('sendConnectionRequest', {
            targetNumber: targetRequestNumber,
            senderNumber: myRequestNumber,
        });
    };

    // Handle modal actions
    const handleAccept = () => {
        if (socket && senderSocketId) {
            socket.emit('requestResponse', {
                accepted: true,
                senderSocketId,
            });
            setShowModal(false);
        }
    };

    const handleReject = () => {
        if (socket && senderSocketId) {
            socket.emit('requestResponse', {
                accepted: false,
                senderSocketId,
            });
            setShowModal(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const generateRandomColor = () => {
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            setColor(randomColor);
        };

        generateRandomColor();
    }, []);

    return (
        <main
            className="flex min-h-screen flex-col items-center p-4 sm:p-8"
            style={{ background: color }}
        >
            <div className="w-full max-w-md mx-auto">
                <h1 className="mb-8 text-2xl font-bold text-center">
                    Remote Desktop Connection App
                </h1>

                {/* Connection status indicator */}
                <div className="mb-2 text-sm text-right">
                    <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>

                {/* Section 1: Request Number */}
                <section className="p-4 mb-6 border rounded-lg shadow-sm bg-white/80">
                    <h2 className="mb-3 text-lg font-semibold">Your Request Number</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2 border rounded-md font-mono text-center bg-gray-50"
                            value={myRequestNumber}
                            readOnly
                        />
                        <button
                            onClick={generateRequestNumber}
                            className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            disabled={isController || isBeingControlled}
                        >
                            Generate New
                        </button>
                    </div>
                </section>

                {/* Section 2: Send Connection Request */}
                <section className="p-4 mb-6 border rounded-lg shadow-sm bg-white/80">
                    <h2 className="mb-3 text-lg font-semibold">Send Connection Request</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md font-mono"
                            placeholder="Enter Remote Number"
                            value={targetRequestNumber}
                            onChange={(e) => setTargetRequestNumber(e.target.value)}
                            disabled={isController || isBeingControlled}
                        />

                        <button
                            onClick={sendConnectionRequest}
                            disabled={
                                !isConnected ||
                                !targetRequestNumber ||
                                isController ||
                                isBeingControlled
                            }
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
                {connectionStatus && !isController && !isBeingControlled && (
                    <section className="p-4 border rounded-lg shadow-sm bg-white/80">
                        <h2 className="mb-3 text-lg font-semibold">Connection Status</h2>
                        <p className={`text-center ${statusColor}`}>{connectionStatus}</p>
                    </section>
                )}
            </div>

            {/* Remote Control Section */}
            {socket && (isController || isBeingControlled) && connectedTo && (
                <div
                    className={`w-full ${
                        isController ? 'max-w-[800px]' : ''
                    } mt-8 border-2 border-blue-500 p-4 rounded-lg`}
                >
                    <div className="mb-4 bg-blue-50 p-2 rounded-md text-sm text-blue-700">
                        {isController
                            ? `Controlling remote browser (connected to: ${connectedTo})`
                            : `Your browser is being controlled (by: ${connectedTo})`}
                    </div>
                    <RemoteControl
                        socket={socket}
                        isController={isController}
                        connectedTo={connectedTo}
                    />
                </div>
            )}

            {/* Remote Cursor (only shown for person being controlled) */}
            {isBeingControlled && <RemoteCursor />}

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
