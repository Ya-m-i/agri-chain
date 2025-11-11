import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Singleton pattern - ensure only one instance
  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Initialize socket connection
  connect(url = null) {
    // Use environment variable or construct from API URL, fallback to default
    if (!url) {
      if (import.meta.env.VITE_SOCKET_URL) {
        url = import.meta.env.VITE_SOCKET_URL
      } else if (import.meta.env.VITE_API_URL) {
        // Use API URL as base for Socket.IO (same server)
        url = import.meta.env.VITE_API_URL
      } else if (import.meta.env.PROD) {
        // Production: use backend domain
        url = 'https://backend.kapalongagrichain.site'
      } else {
        // Development fallback
        url = 'https://agri-chain.onrender.com'
      }
    }
    
    if (this.socket && this.isConnected) {
      console.log('SocketManager: Already connected, reusing existing connection');
      return this.socket;
    }

    // If socket exists but not connected, disconnect first
    if (this.socket && !this.isConnected) {
      console.log('SocketManager: Found disconnected socket, cleaning up...');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('SocketManager: Attempting to connect to:', url);
    console.log('SocketManager: Environment variables:', {
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD
    });

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 30000, // Increased to 30 seconds for free tier servers
      retries: 5, // More retries for reliability
      autoConnect: true,
      forceNew: false, // Don't force new connection - reuse if possible
      reconnection: true,
      reconnectionDelay: 2000, // Start with 2 seconds
      reconnectionDelayMax: 10000, // Max 10 seconds between retries
      reconnectionAttempts: 10, // Increased for better reliability
      // Ensure secure connection for HTTPS
      secure: true,
      rejectUnauthorized: false,
      // Additional options for free tier servers
      upgrade: true,
      rememberUpgrade: true
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket.IO connected successfully, ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Socket.IO disconnected:', reason);
      
      // Only attempt reconnection for unexpected disconnects
      if (reason === 'io server disconnect') {
        console.log('Socket.IO: Server disconnected, will attempt reconnection...');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed after maximum attempts');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('SocketManager: Disconnecting socket...');
      
      // Remove all listeners first
      this.listeners.clear();
      
      // Disconnect the socket
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      
      console.log('SocketManager: Socket disconnected successfully');
    } else {
      console.log('SocketManager: No socket to disconnect');
    }
  }

  // Add event listener with automatic cleanup tracking
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    this.socket.on(event, callback);

    // Return cleanup function
    return () => {
      this.off(event, callback);
    };
  }

  // Remove event listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);
    
    // Remove from tracking
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Emit event
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance (for direct access if needed)
  getSocket() {
    return this.socket;
  }

  // Join a room (useful for farmer-specific updates)
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      console.log('SocketManager: Joining room:', room);
      this.socket.emit('join-room', room);
    } else {
      console.warn('SocketManager: Cannot join room - socket not connected. Room:', room);
      // Attempt to connect and then join room
      try {
        this.connect();
        // Wait a bit for connection to establish, then try joining
        setTimeout(() => {
          if (this.socket && this.isConnected) {
            console.log('SocketManager: Retrying join room after connection:', room);
            this.socket.emit('join-room', room);
          }
        }, 1000);
      } catch (error) {
        console.error('SocketManager: Error connecting to join room:', error);
      }
    }
  }

  // Leave a room
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      console.log('SocketManager: Leaving room:', room);
      this.socket.emit('leave-room', room);
    } else {
      console.log('SocketManager: Cannot leave room - socket not connected');
    }
  }

  // Handle user logout - comprehensive cleanup
  handleUserLogout(userType, userId) {
    try {
      if (userId && userType) {
        const room = userType === 'admin' ? 'admin-room' : `farmer-${userId}`;
        this.leaveRoom(room);
      }
      
      // Disconnect socket completely on logout
      this.disconnect();
      
      console.log('SocketManager: User logout cleanup completed');
    } catch (error) {
      console.error('SocketManager: Error during logout cleanup:', error);
    }
  }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance();

// Export class for testing
export { SocketManager };