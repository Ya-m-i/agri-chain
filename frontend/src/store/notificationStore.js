import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      adminNotifications: [],
      farmerNotifications: {}, // Changed to object to store notifications per farmer
      unreadAdminCount: 0,
      unreadFarmerCount: 0,

      // Add a notification for admin
      addAdminNotification: (notification) => {
        set((state) => ({
          adminNotifications: [{ ...notification, read: false }, ...state.adminNotifications],
          unreadAdminCount: state.unreadAdminCount + 1,
        }))
      },

      // Add a notification for specific farmer
      addFarmerNotification: (notification, farmerId) => {
        set((state) => {
          const farmerNotifications = state.farmerNotifications[farmerId] || []
          return {
            farmerNotifications: {
              ...state.farmerNotifications,
              [farmerId]: [{ ...notification, read: false }, ...farmerNotifications],
            },
            unreadFarmerCount: state.unreadFarmerCount + 1,
          }
        })
      },

      // Mark admin notifications as read
      markAdminNotificationsAsRead: () => {
        set((state) => ({
          adminNotifications: state.adminNotifications.map(n => ({ ...n, read: true })),
          unreadAdminCount: 0
        }))
      },

      // Mark farmer notifications as read
      markFarmerNotificationsAsRead: (farmerId) => {
        set((state) => {
          const farmerNotifications = state.farmerNotifications[farmerId] || []
          const unreadCount = farmerNotifications.filter(n => !n.read).length
          
          return {
            farmerNotifications: {
              ...state.farmerNotifications,
              [farmerId]: farmerNotifications.map(n => ({ ...n, read: true })),
            },
            unreadFarmerCount: Math.max(0, state.unreadFarmerCount - unreadCount),
          }
        })
      },

      // Remove a specific notification
      removeNotification: (notificationId, farmerId) => {
        set((state) => {
          const farmerNotifications = state.farmerNotifications[farmerId] || []
          const notificationToRemove = farmerNotifications.find(n => n.id === notificationId)
          const updatedNotifications = farmerNotifications.filter(n => n.id !== notificationId)
          
          // Only decrement unread count if the notification was unread
          const shouldDecrementUnread = notificationToRemove && !notificationToRemove.read
          
          const newState = {
            farmerNotifications: {
              ...state.farmerNotifications,
              [farmerId]: updatedNotifications,
            },
            unreadFarmerCount: shouldDecrementUnread ? Math.max(0, state.unreadFarmerCount - 1) : state.unreadFarmerCount,
          }
          
          // Force update localStorage immediately
          setTimeout(() => {
            try {
              const stored = localStorage.getItem("notification-storage")
              if (stored) {
                const parsed = JSON.parse(stored)
                parsed.state = { ...parsed.state, ...newState }
                localStorage.setItem("notification-storage", JSON.stringify(parsed))
              }
            } catch (error) {
              console.error("Error updating localStorage:", error)
            }
          }, 0)
          
          return newState
        })
      },

      // Remove a specific admin notification
      removeAdminNotification: (notificationId) => {
        set((state) => {
          const notificationToRemove = state.adminNotifications.find(n => n.id === notificationId)
          const updatedNotifications = state.adminNotifications.filter(n => n.id !== notificationId)
          
          // Only decrement unread count if the notification was unread
          const shouldDecrementUnread = notificationToRemove && !notificationToRemove.read
          
          return {
            adminNotifications: updatedNotifications,
            unreadAdminCount: shouldDecrementUnread ? Math.max(0, state.unreadAdminCount - 1) : state.unreadAdminCount,
          }
        })
      },

      // Get notifications for a specific farmer
      getFarmerNotifications: (farmerId) => {
        return get().farmerNotifications[farmerId] || []
      },

      // Get unread count for a specific farmer
      getFarmerUnreadCount: (farmerId) => {
        const farmerNotifications = get().farmerNotifications[farmerId] || []
        return farmerNotifications.filter(n => !n.read).length
      },

      // Clear all notifications for a specific farmer
      clearFarmerNotifications: (farmerId) => {
        set((state) => {
          const farmerNotifications = state.farmerNotifications[farmerId] || []
          const unreadCount = farmerNotifications.filter(n => !n.read).length
          
          const newState = {
            farmerNotifications: {
              ...state.farmerNotifications,
              [farmerId]: [],
            },
            unreadFarmerCount: Math.max(0, state.unreadFarmerCount - unreadCount),
          }
          
          // Force update localStorage immediately
          setTimeout(() => {
            try {
              const stored = localStorage.getItem("notification-storage")
              if (stored) {
                const parsed = JSON.parse(stored)
                parsed.state = { ...parsed.state, ...newState }
                localStorage.setItem("notification-storage", JSON.stringify(parsed))
              }
            } catch (error) {
              console.error("Error updating localStorage:", error)
            }
          }, 0)
          
          return newState
        })
      },

      // Clear all notifications
      clearNotifications: () => {
        set({
          adminNotifications: [],
          farmerNotifications: {},
          unreadAdminCount: 0,
          unreadFarmerCount: 0,
        })
      },

      // Clear all admin notifications
      clearAdminNotifications: () => {
        set((state) => ({
          adminNotifications: [],
          unreadAdminCount: 0,
        }))
      },

      // Clear notifications for a specific farmer when they logout
      clearFarmerNotificationsOnLogout: (farmerId) => {
        set((state) => {
          const { [farmerId]: removed, ...remainingFarmerNotifications } = state.farmerNotifications
          const unreadCount = (removed || []).filter(n => !n.read).length
          
          return {
            farmerNotifications: remainingFarmerNotifications,
            unreadFarmerCount: Math.max(0, state.unreadFarmerCount - unreadCount),
          }
        })
      },

      // Force clear all notifications for a specific farmer (including localStorage)
      forceClearFarmerNotifications: (farmerId) => {
        // Clear from localStorage directly
        try {
          const stored = localStorage.getItem("notification-storage")
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.state && parsed.state.farmerNotifications) {
              delete parsed.state.farmerNotifications[farmerId]
              localStorage.setItem("notification-storage", JSON.stringify(parsed))
            }
          }
        } catch (error) {
          console.error("Error clearing notifications from localStorage:", error)
        }
        
        // Clear from state
        set((state) => {
          const { [farmerId]: removed, ...remainingFarmerNotifications } = state.farmerNotifications
          const unreadCount = (removed || []).filter(n => !n.read).length
          
          return {
            farmerNotifications: remainingFarmerNotifications,
            unreadFarmerCount: Math.max(0, state.unreadFarmerCount - unreadCount),
          }
        })
      },
    }),
    {
      name: "notification-storage",
      // Persist all notifications including farmer notifications
    },
  ),
)
