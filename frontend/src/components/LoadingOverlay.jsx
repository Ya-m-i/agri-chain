"use client"

import React from 'react'

// Reusable Loading Overlay Component with Blockchain Style
const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Blockchain-style animated loading */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-16 h-16 border-2 border-lime-500/20 rounded-full animate-spin">
          <div className="w-full h-full border-2 border-transparent border-t-lime-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-lime-500 rounded-full animate-pulse shadow-lg shadow-lime-500/50"></div>
        </div>
        
        {/* Blockchain nodes animation */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-lime-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-lime-300 rounded-full animate-bounce delay-300"></div>
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-600 rounded-full animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
