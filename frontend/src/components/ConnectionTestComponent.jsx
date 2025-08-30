import { useState, useEffect } from 'react';
import { socketManager } from '../utils/socket';
import { useAuthStore } from '../store/authStore';

const ConnectionTestComponent = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [testMessage, setTestMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const { user, userType } = useAuthStore();

  useEffect(() => {
    // Initialize socket connection
    socketManager.connect();
    
    // Listen for connection status
    const socket = socketManager.getSocket();
    if (socket) {
      socket.on('connect', () => {
        setConnectionStatus('Connected ✅');
        console.log('Socket connected successfully');
        
        // Join appropriate room
        const room = userType === 'admin' ? 'admin-room' : `farmer-${user?.id}`;
        if (room) {
          socketManager.joinRoom(room);
          console.log(`Joined room: ${room}`);
        }
      });

      socket.on('disconnect', () => {
        setConnectionStatus('Disconnected ❌');
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        setConnectionStatus(`Connection Error: ${error.message} ❌`);
        console.error('Socket connection error:', error);
      });

      // Listen for test messages
      socket.on('test-message', (message) => {
        setReceivedMessages(prev => [...prev, {
          id: Date.now(),
          message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      });
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect'); 
        socket.off('connect_error');
        socket.off('test-message');
      }
    };
  }, [user?.id, userType]);

  const sendTestMessage = () => {
    if (testMessage.trim()) {
      socketManager.emit('test-message', {
        message: testMessage,
        sender: userType,
        senderId: user?.id,
        timestamp: new Date().toISOString()
      });
      setTestMessage('');
    }
  };

  const testConnection = () => {
    socketManager.emit('ping', { timestamp: Date.now() });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔗 Real-Time Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className={`p-3 rounded ${
          connectionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connectionStatus}
        </div>
        <div className="mt-2">
          <strong>Backend URL:</strong> {import.meta.env.VITE_SOCKET_URL || 'https://agri-chain.onrender.com'}
        </div>
        <div>
          <strong>Frontend URL:</strong> {window.location.origin}
        </div>
        <div>
          <strong>User Type:</strong> {userType} | <strong>User ID:</strong> {user?.id || 'Not logged in'}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Tests</h3>
        <div className="space-x-2">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ping Server
          </button>
          <button
            onClick={() => socketManager.connect()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reconnect
          </button>
        </div>
      </div>

      {/* Message Test */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Send Test Message</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            disabled={!testMessage.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>

      {/* Received Messages */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Received Messages</h3>
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500">No messages received yet...</p>
          ) : (
            receivedMessages.map((msg) => (
              <div key={msg.id} className="mb-2 p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">{msg.timestamp}</div>
                <div>{msg.message}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
        <h4 className="font-semibold mb-1">Environment Variables:</h4>
        <div>VITE_API_URL: {import.meta.env.VITE_API_URL || 'Not set'}</div>
        <div>VITE_SOCKET_URL: {import.meta.env.VITE_SOCKET_URL || 'Not set'}</div>
        <div>NODE_ENV: {import.meta.env.NODE_ENV || 'Not set'}</div>
        <div>MODE: {import.meta.env.MODE || 'Not set'}</div>
      </div>
    </div>
  );
};

export default ConnectionTestComponent;