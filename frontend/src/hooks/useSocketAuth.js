import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../utils/socket';

/**
 * Custom hook to manage Socket.IO connection based on authentication state
 * Handles connection, room management, and disconnection on logout
 */
export const useSocketAuth = () => {
  const { isAuthenticated, user, userType } = useAuthStore();
  const prevAuthStateRef = useRef(isAuthenticated);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    // Check if authentication state changed
    const wasAuthenticated = prevAuthStateRef.current;
    const isNowAuthenticated = isAuthenticated;

    if (isNowAuthenticated && user?.id && userType) {
      // User just logged in or is authenticated
      console.log('useSocketAuth: User authenticated, connecting socket...');
      
      try {
        // Connect socket
        socketManager.connect();
        
        // Join appropriate room
        const room = userType === 'admin' ? 'admin-room' : `farmer-${user.id}`;
        socketManager.joinRoom(room);
        currentRoomRef.current = room;
        
        console.log(`useSocketAuth: Connected and joined room: ${room}`);
      } catch (error) {
        console.error('useSocketAuth: Error during socket connection:', error);
      }
      
    } else if (wasAuthenticated && !isNowAuthenticated) {
      // User just logged out
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

  }, [isAuthenticated, user?.id, userType]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (currentRoomRef.current) {
        socketManager.leaveRoom(currentRoomRef.current);
      }
      // Only disconnect if user is not authenticated
      if (!isAuthenticated) {
        socketManager.disconnect();
      }
    };
  }, [isAuthenticated]);

  return {
    isConnected: socketManager.getConnectionStatus(),
    currentRoom: currentRoomRef.current
  };
};