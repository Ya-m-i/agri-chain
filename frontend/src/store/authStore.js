import { create } from "zustand"
import { persist } from "zustand/middleware"
import { socketManager } from "../utils/socket"

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      userType: null,
      user: null,
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
        // If somehow it's not, this should throw an error rather than create fake data
        if (!user && userType === "farmer") {
          throw new Error("Farmer authentication requires user data");
        }
        
        set({
          isAuthenticated: true,
          userType,
          user,
        });
      },
      logout: () => {
        // Disconnect socket before clearing auth state
        try {
          const currentUser = useAuthStore.getState().user;
          const currentUserType = useAuthStore.getState().userType;
          
          if (currentUser?.id && currentUserType) {
            const room = currentUserType === 'admin' ? 'admin-room' : `farmer-${currentUser.id}`;
            console.log('Logout: Leaving room:', room);
            socketManager.leaveRoom(room);
          }
          
          console.log('Logout: Disconnecting socket...');
          socketManager.disconnect();
        } catch (error) {
          console.error('Error during socket cleanup on logout:', error);
        }
        
        // Clear localStorage for backward compatibility
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("isFarmer");
        
        // Clear auth state
        set({ isAuthenticated: false, userType: null, user: null });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
)
