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
  connect(url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000') {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    console.log('SocketManager: Attempting to connect to:', url);
    console.log('SocketManager: Environment variables:', {
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    });

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3,
      autoConnect: true,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket.IO connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
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
      this.socket.emit('join-room', room);
    }
  }

  // Leave a room
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
    }
  }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance();

// Export class for testing
export { SocketManager };