import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"
import { socketManager } from "../utils/socket"

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        userType: null,
        user: null,
        isInitialized: false,
        
        // Initialize auth state from persisted storage
        initializeAuth: () => {
          const state = get();
          console.log('Auth Store: Initializing authentication state...', state);
          
          if (state.isAuthenticated && state.user && state.userType) {
            console.log('Auth Store: Found persisted auth, reconnecting socket...');
            // Reconnect socket on app initialization if user was authenticated
            try {
              socketManager.connect();
              const room = state.userType === 'admin' ? 'admin-room' : `farmer-${state.user.id}`;
              socketManager.joinRoom(room);
              console.log(`Auth Store: Reconnected to room: ${room}`);
            } catch (error) {
              console.error('Auth Store: Error reconnecting socket:', error);
            }
          }
          
          set({ isInitialized: true });
        },
        
        login: (userType, userData = null) => {
          let user = userData;
          
          // If no user data provided, create default admin user
          if (!user && userType === "admin") {
            user = {
              id: "admin-001",
              name: "Admin User",
              email: "admin@example.com",
              phone: "09987654321",
            };
          }
          
          // For farmer, userData should always be provided from login response
          if (!user && userType === "farmer") {
            console.error("Auth Store: Farmer authentication requires user data");
            throw new Error("Farmer authentication requires user data");
          }
          
          console.log('Auth Store: Logging in user');
          console.log('Auth Store: userType:', userType);
          console.log('Auth Store: user.id:', user?.id);
          console.log('Auth Store: Complete user object:', JSON.stringify(user, null, 2));
          
          // Verify user has required fields
          if (userType === "farmer" && !user.id) {
            console.error("Auth Store: Farmer user object missing 'id' field:", user);
            throw new Error("Farmer user data must include 'id' field");
          }
          
          // Set auth state
          set({
            isAuthenticated: true,
            userType,
            user,
          });
          
          // Connect socket and join appropriate room
          try {
            socketManager.connect();
            const room = userType === 'admin' ? 'admin-room' : `farmer-${user.id}`;
            socketManager.joinRoom(room);
            console.log(`Auth Store: Connected and joined room: ${room}`);
          } catch (error) {
            console.error('Auth Store: Error connecting socket on login:', error);
          }
        },
        
        logout: async () => {
          const currentState = get();
          console.log('Auth Store: Logging out user...', currentState);
          
          // Call backend logout API for farmers
          try {
            if (currentState.userType === 'farmer' && currentState.user?.id) {
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/farmers/logout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ farmerId: currentState.user.id }),
              });
              
              if (response.ok) {
                console.log('Auth Store: Backend logout successful');
              } else {
                console.warn('Auth Store: Backend logout failed, but continuing with local logout');
              }
            }
          } catch (error) {
            console.error('Auth Store: Error calling backend logout:', error);
          }
          
          // Disconnect socket before clearing auth state
          try {
            if (currentState.user?.id && currentState.userType) {
              const room = currentState.userType === 'admin' ? 'admin-room' : `farmer-${currentState.user.id}`;
              console.log('Auth Store: Leaving room:', room);
              socketManager.leaveRoom(room);
            }
            
            console.log('Auth Store: Disconnecting socket...');
            socketManager.disconnect();
          } catch (error) {
            console.error('Auth Store: Error during socket cleanup on logout:', error);
          }
          
          // Clear localStorage for backward compatibility
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("isFarmer");
          
          // Clear auth state
          set({ 
            isAuthenticated: false, 
            userType: null, 
            user: null 
          });
          
          console.log('Auth Store: Logout completed');
        },
        
        updateUser: (userData) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : userData,
          })),
      }),
      {
        name: "auth-storage",
        // Only persist essential auth data
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          userType: state.userType,
          user: state.user,
        }),
      },
    ),
  ),
)
