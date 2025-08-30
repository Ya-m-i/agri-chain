import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../utils/socket';

/**
 * Custom hook to manage Socket.IO connection based on authentication state
 * Handles connection, room management, and disconnection on logout
 */
export const useSocketAuth = () => {
  const { isAuthenticated, user, userType, isInitialized } = useAuthStore();
  const prevAuthStateRef = useRef(isAuthenticated);
  const currentRoomRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const status = socketManager.getConnectionStatus();
      setConnectionStatus(status);
    };

    // Initial status check
    updateStatus();

    // Listen for connection changes
    const socket = socketManager.getSocket();
    if (socket) {
      socket.on('connect', updateStatus);
      socket.on('disconnect', updateStatus);
      
      return () => {
        socket.off('connect', updateStatus);
        socket.off('disconnect', updateStatus);
      };
    }
  }, []);

  useEffect(() => {
    // Only proceed if auth has been initialized
    if (!isInitialized) {
      console.log('useSocketAuth: Waiting for auth initialization...');
      return;
    }

    const wasAuthenticated = prevAuthStateRef.current;
    const isNowAuthenticated = isAuthenticated;

    console.log('useSocketAuth: Auth state change detected', {
      wasAuthenticated,
      isNowAuthenticated,
      user: user?.id,
      userType
    });

    if (isNowAuthenticated && user?.id && userType) {
      // User is authenticated - ensure socket connection
      console.log('useSocketAuth: User authenticated, ensuring socket connection...');
      
      try {
        // Connect socket if not already connected
        if (!socketManager.getConnectionStatus()) {
          socketManager.connect();
        }
        
        // Join appropriate room
        const room = userType === 'admin' ? 'admin-room' : `farmer-${user.id}`;
        
        // Only join room if it's different from current room
        if (currentRoomRef.current !== room) {
          // Leave previous room if exists
          if (currentRoomRef.current) {
            socketManager.leaveRoom(currentRoomRef.current);
          }
          
          // Join new room
          socketManager.joinRoom(room);
          currentRoomRef.current = room;
          
          console.log(`useSocketAuth: Joined room: ${room}`);
        }
        
      } catch (error) {
        console.error('useSocketAuth: Error during socket connection:', error);
        
        // Retry connection after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('useSocketAuth: Retrying socket connection...');
          try {
            socketManager.connect();
          } catch (retryError) {
            console.error('useSocketAuth: Retry connection failed:', retryError);
          }
        }, 2000);
      }
      
    } else if (wasAuthenticated && !isNowAuthenticated) {
      // User logged out - clean up socket
      console.log('useSocketAuth: User logged out, cleaning up socket...');
      
      try {
        // Leave current room if any
        if (currentRoomRef.current) {
          socketManager.leaveRoom(currentRoomRef.current);
          currentRoomRef.current = null;
        }
        
        // Disconnect socket
        socketManager.disconnect();
        
        console.log('useSocketAuth: Socket cleanup completed on logout');
      } catch (error) {
        console.error('useSocketAuth: Error during socket cleanup:', error);
      }
    }

    // Update previous auth state
    prevAuthStateRef.current = isNowAuthenticated;

  }, [isAuthenticated, user?.id, userType, isInitialized]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clear any pending reconnect timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Only cleanup if user is not authenticated
      if (!isAuthenticated) {
        if (currentRoomRef.current) {
          socketManager.leaveRoom(currentRoomRef.current);
        }
        socketManager.disconnect();
      }
    };
  }, [isAuthenticated]);

  return {
    isConnected: connectionStatus,
    currentRoom: currentRoomRef.current
  };
};