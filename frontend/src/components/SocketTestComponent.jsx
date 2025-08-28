import React, { useState, useEffect } from 'react';
import { useSocketQuery, useSocketCacheUpdate } from '../hooks/useSocketQuery.js';
import { useClaims, useAssistances } from '../hooks/useAPI.js';
import { useAuthStore } from '../store/authStore.js';

/**
 * Test component to verify Socket.IO + React Query integration
 * This component should show real-time updates without page refresh
 */
const SocketTestComponent = () => {
  const { user, userType } = useAuthStore();
  const [testEvents, setTestEvents] = useState([]);
  const updateCache = useSocketCacheUpdate();
  
  // Use React Query hooks to display current data
  const { data: claims = [], isLoading: claimsLoading } = useClaims(userType === 'farmer' ? user?.id : null);
  const { data: assistance = [], isLoading: assistanceLoading } = useAssistances();
  
  // Initialize Socket.IO integration
  const { isConnected, socket } = useSocketQuery();
  
  // Add test event tracking
  useEffect(() => {
    if (!socket) return;
    
    const events = [
      'claim-created',
      'claim-updated', 
      'assistance-created',
      'application-created',
      'application-updated'
    ];
    
    const handlers = events.map(eventName => {
      const handler = (data) => {
        setTestEvents(prev => [...prev, {
          id: Date.now(),
          event: eventName,
          data: data,
          timestamp: new Date().toISOString()
        }]);
        console.log(`Socket event received: ${eventName}`, data);
      };
      
      socket.on(eventName, handler);
      return () => socket.off(eventName, handler);
    });
    
    // Cleanup
    return () => {
      handlers.forEach(cleanup => cleanup());
    };
  }, [socket]);
  
  // Test functions
  const testClaimUpdate = () => {
    if (claims.length > 0) {
      const testClaim = { ...claims[0], status: 'approved', adminFeedback: 'Test approval via Socket.IO' };
      updateCache(['claims'], (oldData) => {
        if (Array.isArray(oldData)) {
          return oldData.map(claim => 
            claim._id === testClaim._id ? testClaim : claim
          );
        }
        return oldData;
      });
    }
  };
  
  const clearTestEvents = () => {
    setTestEvents([]);
  };
  
  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to test Socket.IO integration</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Socket.IO + React Query Integration Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          User: {user?.name || 'Unknown'} ({userType})
        </p>
      </div>
      
      {/* Current Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Claims Data ({claims.length} items)
          </h3>
          {claimsLoading ? (
            <p className="text-blue-600">Loading...</p>
          ) : (
            <div className="space-y-2">
              {claims.slice(0, 3).map(claim => (
                <div key={claim._id} className="text-sm bg-white p-2 rounded border">
                  <span className="font-medium">ID:</span> {claim._id?.slice(-6)}
                  <br />
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            Assistance Data ({assistance.length} items)
          </h3>
          {assistanceLoading ? (
            <p className="text-green-600">Loading...</p>
          ) : (
            <div className="space-y-2">
              {assistance.slice(0, 3).map(item => (
                <div key={item._id} className="text-sm bg-white p-2 rounded border">
                  <span className="font-medium">Type:</span> {item.assistanceType}
                  <br />
                  <span className="font-medium">Available:</span> {item.availableQuantity}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testClaimUpdate}
            disabled={claims.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            Test Claim Update
          </button>
          <button
            onClick={clearTestEvents}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Clear Events
          </button>
        </div>
      </div>
      
      {/* Real-time Events Log */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Real-time Events ({testEvents.length})</h3>
          {testEvents.length > 0 && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Socket.IO working!
            </span>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {testEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No real-time events received yet. Try creating or updating claims/assistance in another tab.
            </p>
          ) : (
            <div className="space-y-2">
              {testEvents.slice().reverse().map(event => (
                <div key={event.id} className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-blue-800">{event.event}</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.data._id ? `ID: ${event.data._id.slice(-6)}` : 'No ID'}
                        {event.data.status && ` - Status: ${event.data.status}`}
                        {event.data.assistanceType && ` - Type: ${event.data.assistanceType}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">How to Test:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Ensure both frontend and backend servers are running</li>
          <li>2. Open this page in one tab and the dashboard in another</li>
          <li>3. Create or update claims/assistance in the dashboard</li>
          <li>4. Watch this component for real-time updates without page refresh</li>
          <li>5. Events should appear in the log above when changes occur</li>
        </ul>
      </div>
    </div>
  );
};

export default SocketTestComponent;