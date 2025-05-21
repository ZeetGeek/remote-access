'use client';

import { useEffect } from 'react';

export default function ConnectionModal({ isOpen, senderNumber, onAccept, onReject, onClose }) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Connection Request
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Remote connection request from <span className="font-mono font-bold">{senderNumber}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Do you want to accept this connection?
          </p>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}