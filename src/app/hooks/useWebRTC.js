'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

export default function useWebRTC(socket, isController, connectedTo) {
  const [connected, setConnected] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const peerRef = useRef(null);
  const dataChannelRef = useRef(null);
  
  // Initialize the peer connection
  const initializePeer = useCallback(async (initialStream = null) => {
    if (!socket || !connectedTo) {
      console.error('Cannot initialize peer: missing socket or connectedTo');
      return;
    }
    
    console.log(`Initializing WebRTC peer. isController: ${isController}, connectedTo: ${connectedTo}`);
    
    try {
      // Create a new peer based on whether this client is the controller or the controlled
      const peer = new Peer({
        initiator: isController,
        trickle: true,
        stream: initialStream,
        // With these config options, WebRTC will prefer local connections when testing
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ],
          iceTransportPolicy: 'all', // Try all connection methods
          sdpSemantics: 'unified-plan'
        }
      });
      
      // Handle signals that need to be exchanged for the WebRTC connection
      peer.on('signal', signal => {
        console.log('Generated signal, sending to peer');
        socket.emit('signal', {
          signal,
          targetNumber: connectedTo
        });
      });
      
      // When the peer connection is established
      peer.on('connect', () => {
        console.log('Peer connection established');
        setConnected(true);
        
        // Create a data channel for control events if this is the controller
        if (isController) {
          const dataChannel = peer.createDataChannel('controlEvents');
          dataChannel.onopen = () => {
            console.log('Data channel opened');
            dataChannelRef.current = dataChannel;
          };
          dataChannel.onclose = () => {
            console.log('Data channel closed');
            dataChannelRef.current = null;
          };
        }
      });
      
      // Handle the remote stream (for the controller to see the controlled screen)
      peer.on('stream', remoteStream => {
        console.log('Received remote stream');
        setStream(remoteStream);
      });
      
      // Handle data channel for the controlled side
      peer.on('data', data => {
        try {
          const controlEvent = JSON.parse(data.toString());
          console.log('Received control event', controlEvent);
          
          // Dispatch as a custom event so it can be handled by the UI
          const customEvent = new CustomEvent('remote-control', {
            detail: controlEvent
          });
          window.dispatchEvent(customEvent);
        } catch (error) {
          console.error('Error parsing control event', error);
        }
      });
      
      // Handle errors
      peer.on('error', err => {
        console.error('Peer error:', err);
        setError(err.message);
      });
      
      // Store the peer instance
      peerRef.current = peer;
      return peer;
    } catch (err) {
      console.error('Failed to initialize peer:', err);
      setError('Failed to initialize connection: ' + err.message);
      return null;
    }
  }, [socket, isController, connectedTo]);
  
  // Handle incoming signals
  useEffect(() => {
    if (!socket) return;
    
    const handleSignal = ({ signal, from }) => {
      console.log('Received signal from peer:', from);
      console.log('Current peer status:', {
        exists: !!peerRef.current,
        connected: connected,
        isController: isController,
        connectedTo: connectedTo
      });
      
      if (peerRef.current) {
        try {
          peerRef.current.signal(signal);
          console.log('Signal applied to peer');
        } catch (err) {
          console.error('Error applying signal to peer:', err);
          setError('Signal error: ' + err.message);
        }
      } else {
        console.warn('Received signal but no peer exists yet');
      }
    };
    
    socket.on('signal', handleSignal);
    
    return () => {
      socket.off('signal', handleSignal);
    };
  }, [socket, connected, isController, connectedTo]);
  
  // Start sharing screen if this is the controlled device
  useEffect(() => {
    if (!isController && socket && connectedTo) {
      console.log('Starting screen sharing as the controlled device');
      
      const startScreenSharing = async () => {
        try {
          // Request screen sharing permissions
          console.log('Requesting screen sharing permissions...');
          
          if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error('Screen sharing API not supported in this browser');
          }
          
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always',
              displaySurface: 'browser'
            },
            audio: false
          });
          
          console.log('Screen sharing permissions granted');
          
          // Check if we have valid video tracks
          if (!screenStream.getVideoTracks().length) {
            throw new Error('No video track in the screen sharing stream');
          }
          
          // Track when screen sharing stops
          screenStream.getVideoTracks()[0].onended = () => {
            console.log('Screen sharing ended by user');
            cleanupConnection();
          };
          
          // Initialize the peer with the screen stream
          console.log('Initializing peer with screen stream');
          initializePeer(screenStream);
          setStream(screenStream);
        } catch (err) {
          console.error('Failed to get screen media:', err);
          setError('Failed to start screen sharing: ' + err.message);
          
          // Let the user know we couldn't start screen sharing
          if (socket) {
            socket.emit('screenShareError', {
              targetNumber: connectedTo,
              error: err.message
            });
          }
        }
      };
      
      startScreenSharing();
    } else if (isController && socket && connectedTo) {
      // Just initialize the peer without a stream for the controller
      console.log('Initializing as the controller (without stream)');
      initializePeer();
    } else {
      console.log('Not starting WebRTC connection yet', { isController, socketExists: !!socket, connectedTo });
    }
    
    return cleanupConnection;
  }, [isController, socket, connectedTo, initializePeer]);
  
  // Clean up function
  const cleanupConnection = useCallback(() => {
    // Stop all tracks in the stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Close the peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    // Reset states
    setConnected(false);
  }, [stream]);
  
  // Send a control event to the controlled device
  const sendControlEvent = useCallback((eventData) => {
    if (!dataChannelRef.current || !connected) {
      console.log('Cannot send control event: no data channel or not connected');
      return false;
    }
    
    try {
      dataChannelRef.current.send(JSON.stringify(eventData));
      return true;
    } catch (err) {
      console.error('Failed to send control event:', err);
      return false;
    }
  }, [connected]);
  
  return {
    connected,
    stream,
    error,
    sendControlEvent,
    cleanupConnection
  };
}