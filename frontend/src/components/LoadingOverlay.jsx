"use client"

import React, { useState, useEffect } from 'react'

// Reusable Loading Overlay Component with Blockchain Style and Progress Messages
const LoadingOverlay = ({ isVisible, message }) => {
  const [progressMessage, setProgressMessage] = useState(message || "Connecting...");
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0);
      setProgressMessage(message || "Connecting...");
      return;
    }
    
    // Update progress message based on elapsed time
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const seconds = Math.floor(prev / 1000);
        
        // Update message based on time elapsed
        if (seconds < 5) {
          setProgressMessage("Connecting to server...");
        } else if (seconds < 15) {
          setProgressMessage("Verifying credentials...");
        } else if (seconds < 30) {
          setProgressMessage("Slow connection detected. Please wait...");
        } else {
          setProgressMessage("Still connecting. This may take longer on slow connections...");
        }
        
        return prev + 1000;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, message]);
  
  if (!isVisible) return null;
  
  // Detect connection quality
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.downlink < 1.5
  );
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-lime-500 max-w-sm w-full mx-4">
        {/* Blockchain-style animated loading */}
        <div className="relative mb-6">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 border-2 border-lime-500/20 rounded-full animate-spin mx-auto">
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
        
        {/* Progress message */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {progressMessage}
          </p>
          {isSlowConnection && (
            <p className="text-sm text-yellow-600 mb-2">
              ⚠️ Slow connection detected. This may take up to 45 seconds.
            </p>
          )}
          <p className="text-xs text-gray-500">
            Please do not close this window
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
