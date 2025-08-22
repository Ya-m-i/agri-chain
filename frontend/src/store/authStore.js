import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      userType: null,
      user: null,
      login: (userType, userData = null) =>
        set({
          isAuthenticated: true,
          userType,
          user: userData || {
            id: userType === "farmer" ? "F-001" : "A-001",
            name: userType === "farmer" ? "Juan Dela Cruz" : "Admin User",
            email: userType === "farmer" ? "juan@example.com" : "admin@example.com",
            phone: userType === "farmer" ? "09123456789" : "09987654321",
          },
        }),
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
