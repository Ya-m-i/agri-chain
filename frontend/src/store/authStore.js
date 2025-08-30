import { create } from "zustand"
import { persist } from "zustand/middleware"

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
      logout: () => set({ isAuthenticated: false, userType: null, user: null }),
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
