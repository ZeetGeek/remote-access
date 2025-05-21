'use client';

import { useEffect, useState } from 'react';

export default function RemoteCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Listen for remote control events
  useEffect(() => {
    const handleRemoteControl = (event) => {
      const { type, x, y } = event.detail;
      
      if (type === 'mousemove') {
        setPosition({ x, y });
        setIsVisible(true);
        
        // Auto-hide cursor after inactivity
        if (window.cursorTimeoutId) {
          clearTimeout(window.cursorTimeoutId);
        }
        
        window.cursorTimeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else if (type === 'mousedown') {
        setIsClicking(true);
      } else if (type === 'mouseup') {
        setIsClicking(false);
      }
    };
    
    window.addEventListener('remote-control', handleRemoteControl);
    
    return () => {
      window.removeEventListener('remote-control', handleRemoteControl);
      if (window.cursorTimeoutId) {
        clearTimeout(window.cursorTimeoutId);
      }
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Custom cursor */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L10 18L12 12L18 10L2 2Z"
          fill={isClicking ? "rgba(255, 50, 50, 0.8)" : "rgba(255, 100, 100, 0.6)"}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}