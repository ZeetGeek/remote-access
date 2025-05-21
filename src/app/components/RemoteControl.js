'use client';

import { useEffect, useRef, useState } from 'react';
import useWebRTC from '../hooks/useWebRTC';

export default function RemoteControl({ socket, isController, connectedTo }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // Initialize WebRTC connection
  const { connected, stream, error, sendControlEvent } = useWebRTC(
    socket,
    isController,
    connectedTo
  );
  
  // Handle screen stream for the controller
  useEffect(() => {
    if (stream && videoRef.current && isController) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isController]);
  
  // Set up event listeners for remote control if this is the controller
  useEffect(() => {
    if (!isController || !connected || !containerRef.current) return;
    
    const container = containerRef.current;
    
    // Calculate the position on the remote screen
    const calculateRemotePosition = (clientX, clientY) => {
      if (!videoRef.current) return { x: 0, y: 0 };
      
      const rect = container.getBoundingClientRect();
      const videoWidth = videoRef.current.videoWidth || dimensions.width;
      const videoHeight = videoRef.current.videoHeight || dimensions.height;
      
      // Calculate position within the visible container
      const x = (clientX - rect.left) / scale - offset.x;
      const y = (clientY - rect.top) / scale - offset.y;
      
      // Calculate position relative to the original video dimensions
      const originalX = x / (container.clientWidth / videoWidth);
      const originalY = y / (container.clientHeight / videoHeight);
      
      return { x: originalX, y: originalY };
    };
    
    // Mouse movement handler
    const handleMouseMove = (e) => {
      const { x, y } = calculateRemotePosition(e.clientX, e.clientY);
      
      sendControlEvent({
        type: 'mousemove',
        x,
        y
      });
    };
    
    // Mouse click handlers
    const handleMouseDown = (e) => {
      const { x, y } = calculateRemotePosition(e.clientX, e.clientY);
      
      sendControlEvent({
        type: 'mousedown',
        x,
        y,
        button: e.button
      });
      
      // Prevent default to avoid selecting text, etc.
      e.preventDefault();
    };
    
    const handleMouseUp = (e) => {
      const { x, y } = calculateRemotePosition(e.clientX, e.clientY);
      
      sendControlEvent({
        type: 'mouseup',
        x,
        y,
        button: e.button
      });
      
      // Also send a click event
      sendControlEvent({
        type: 'click',
        x,
        y,
        button: e.button
      });
      
      // Prevent default
      e.preventDefault();
    };
    
    // Keyboard event handlers
    const handleKeyDown = (e) => {
      // Only forward events if the container is focused
      if (document.activeElement !== container) return;
      
      sendControlEvent({
        type: 'keydown',
        key: e.key,
        code: e.code
      });
      
      // Prevent default to avoid browser shortcuts except for refresh and dev tools
      if (!['F5', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      // Only forward events if the container is focused
      if (document.activeElement !== container) return;
      
      sendControlEvent({
        type: 'keyup',
        key: e.key,
        code: e.code
      });
      
      // Prevent default
      if (!['F5', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    // Add event listeners to the container
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Make the container focusable for keyboard events
    container.tabIndex = 0;
    
    return () => {
      // Clean up event listeners
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isController, connected, sendControlEvent, dimensions, scale, offset]);
  
  // When the video metadata loads, update dimensions
  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };
  
  // Pan and zoom handlers
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const handlePanStart = (e) => {
    if (e.ctrlKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };
  
  const handlePanMove = (e) => {
    if (isPanning) {
      const dx = (e.clientX - panStart.x) / scale;
      const dy = (e.clientY - panStart.y) / scale;
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };
  
  const handlePanEnd = () => {
    setIsPanning(false);
  };
  
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      // Calculate new scale (zoom level)
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.25, scale + delta), 4);
      setScale(newScale);
      e.preventDefault();
    }
  };
  
  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {isController ? (
        // The controller UI (shows the remote screen)
        <div className="space-y-2">
          <p className="text-sm text-blue-600">
            {connected ? 'Connected - You can control the remote browser' : 'Connecting to remote browser...'}
          </p>
          
          <div
            ref={containerRef}
            className="relative w-full h-[800px] rounded-md overflow-hidden bg-black border-2 border-gray-300 focus:outline-none focus:border-blue-500"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onWheel={handleWheel}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{
                transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
              }}
              onLoadedMetadata={handleVideoMetadata}
            />
            
            {!connected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Connecting to remote browser...</p>
                </div>
              </div>
            )}
            
            {connected && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs py-1 px-3 rounded-md">
                Click to interact. Hold Ctrl + drag to pan, Ctrl + wheel to zoom.
              </div>
            )}
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Press Tab key to focus the container for keyboard input
          </div>
        </div>
      ) : (
        // The controlled UI (shows sharing status)
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 shadow-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <p>
              {connected 
                ? 'Your browser is being shared and controlled remotely' 
                : 'Preparing to share your browser...'}
            </p>
          </div>
          
          {connected && (
            <p className="mt-2 text-sm">
              The other user can now control your browser. You will see their cursor moving on your screen.
            </p>
          )}
        </div>
      )}
    </div>
  );
}