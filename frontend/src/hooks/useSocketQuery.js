import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '../utils/socket.js';
import { useAuthStore } from '../store/authStore.js';

// Query key constants for consistency
export const SOCKET_QUERY_KEYS = {
  CLAIMS: 'claims',
  FARMERS: 'farmers', 
  ASSISTANCE: 'assistance',
  APPLICATIONS: 'applications',
  CROP_INSURANCE: 'cropInsurance',
  NOTIFICATIONS: 'notifications'
};

/**
 * Custom hook for Socket.IO integration with React Query
 * Prevents infinite loops and provides smooth real-time updates
 */
export const useSocketQuery = (options = {}) => {
  const queryClient = useQueryClient();
  const { user, userType } = useAuthStore();
  const cleanupFunctionsRef = useRef([]);
  const isInitializedRef = useRef(false);

  // Prevent multiple initializations
  const initializeSocket = useCallback(() => {
    if (isInitializedRef.current) return;
    
    try {
      socketManager.connect(options.serverUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      isInitializedRef.current = true;
      
      // Join user-specific room for targeted updates
      if (user?.id) {
        const room = userType === 'admin' ? 'admin-room' : `farmer-${user.id}`;
        socketManager.joinRoom(room);
      }
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }, [options.serverUrl, user?.id, userType]);

  // Safe cache update function to prevent infinite loops
  const updateQueryCache = useCallback((queryKey, updateFunction, options = {}) => {
    try {
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        
        // Prevent updates during mutations to avoid conflicts
        const isMutating = queryClient.isMutating({ mutationKey: queryKey });
        if (isMutating && !options.forceDuringMutation) {
          return oldData;
        }

        return updateFunction(oldData);
      });

      // Optionally invalidate to refetch from server
      if (options.invalidate) {
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      console.error('Cache update error:', error);
    }
  }, [queryClient]);

  // Claims real-time updates
  const setupClaimsListeners = useCallback(() => {
    const events = [
      {
        name: 'claim-created',
        handler: (newClaim) => {
          updateQueryCache([SOCKET_QUERY_KEYS.CLAIMS], (oldData) => {
            if (Array.isArray(oldData)) {
              return [newClaim, ...oldData];
            }
            return oldData;
          });
          
          // Update farmer-specific claims if applicable
          if (newClaim.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.CLAIMS, newClaim.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return [newClaim, ...oldData];
              }
              return oldData;
            });
          }
        }
      },
      {
        name: 'claim-updated',
        handler: (updatedClaim) => {
          updateQueryCache([SOCKET_QUERY_KEYS.CLAIMS], (oldData) => {
            if (Array.isArray(oldData)) {
              return oldData.map(claim => 
                claim._id === updatedClaim._id ? { ...claim, ...updatedClaim } : claim
              );
            }
            return oldData;
          });

          // Update farmer-specific claims
          if (updatedClaim.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.CLAIMS, updatedClaim.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return oldData.map(claim => 
                  claim._id === updatedClaim._id ? { ...claim, ...updatedClaim } : claim
                );
              }
              return oldData;
            });
          }
        }
      }
    ];

    return events.map(({ name, handler }) => socketManager.on(name, handler));
  }, [updateQueryCache]);

  // Assistance applications real-time updates
  const setupAssistanceListeners = useCallback(() => {
    const events = [
      {
        name: 'assistance-created',
        handler: (newAssistance) => {
          updateQueryCache([SOCKET_QUERY_KEYS.ASSISTANCE], (oldData) => {
            if (Array.isArray(oldData)) {
              return [newAssistance, ...oldData];
            }
            return oldData;
          });
        }
      },
      {
        name: 'application-created',
        handler: (newApplication) => {
          updateQueryCache([SOCKET_QUERY_KEYS.APPLICATIONS], (oldData) => {
            if (Array.isArray(oldData)) {
              return [newApplication, ...oldData];
            }
            return oldData;
          });

          // Update farmer-specific applications
          if (newApplication.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.APPLICATIONS, newApplication.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return [newApplication, ...oldData];
              }
              return oldData;
            });
          }
        }
      },
      {
        name: 'application-updated',
        handler: (updatedApplication) => {
          updateQueryCache([SOCKET_QUERY_KEYS.APPLICATIONS], (oldData) => {
            if (Array.isArray(oldData)) {
              return oldData.map(app => 
                app._id === updatedApplication._id ? { ...app, ...updatedApplication } : app
              );
            }
            return oldData;
          });

          // Update farmer-specific applications
          if (updatedApplication.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.APPLICATIONS, updatedApplication.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return oldData.map(app => 
                  app._id === updatedApplication._id ? { ...app, ...updatedApplication } : app
                );
              }
              return oldData;
            });
          }
        }
      }
    ];

    return events.map(({ name, handler }) => socketManager.on(name, handler));
  }, [updateQueryCache]);

  // Farmers real-time updates
  const setupFarmersListeners = useCallback(() => {
    const events = [
      {
        name: 'farmer-registered',
        handler: (newFarmer) => {
          updateQueryCache([SOCKET_QUERY_KEYS.FARMERS], (oldData) => {
            if (Array.isArray(oldData)) {
              return [newFarmer, ...oldData];
            }
            return oldData;
          });
        }
      },
      {
        name: 'farmer-updated',
        handler: (updatedFarmer) => {
          updateQueryCache([SOCKET_QUERY_KEYS.FARMERS], (oldData) => {
            if (Array.isArray(oldData)) {
              return oldData.map(farmer => 
                farmer._id === updatedFarmer._id ? { ...farmer, ...updatedFarmer } : farmer
              );
            }
            return oldData;
          });
        }
      }
    ];

    return events.map(({ name, handler }) => socketManager.on(name, handler));
  }, [updateQueryCache]);

  // Crop insurance real-time updates
  const setupInsuranceListeners = useCallback(() => {
    const events = [
      {
        name: 'insurance-created',
        handler: (newInsurance) => {
          updateQueryCache([SOCKET_QUERY_KEYS.CROP_INSURANCE], (oldData) => {
            if (Array.isArray(oldData)) {
              return [newInsurance, ...oldData];
            }
            return oldData;
          });

          // Update farmer-specific insurance
          if (newInsurance.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.CROP_INSURANCE, newInsurance.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return [newInsurance, ...oldData];
              }
              return oldData;
            });
          }
        }
      },
      {
        name: 'insurance-updated',
        handler: (updatedInsurance) => {
          updateQueryCache([SOCKET_QUERY_KEYS.CROP_INSURANCE], (oldData) => {
            if (Array.isArray(oldData)) {
              return oldData.map(insurance => 
                insurance._id === updatedInsurance._id ? { ...insurance, ...updatedInsurance } : insurance
              );
            }
            return oldData;
          });

          // Update farmer-specific insurance
          if (updatedInsurance.farmerId) {
            updateQueryCache([SOCKET_QUERY_KEYS.CROP_INSURANCE, updatedInsurance.farmerId], (oldData) => {
              if (Array.isArray(oldData)) {
                return oldData.map(insurance => 
                  insurance._id === updatedInsurance._id ? { ...insurance, ...updatedInsurance } : insurance
                );
              }
              return oldData;
            });
          }
        }
      }
    ];

    return events.map(({ name, handler }) => socketManager.on(name, handler));
  }, [updateQueryCache]);

  // Initialize socket and set up all listeners
  useEffect(() => {
    initializeSocket();

    // Set up all event listeners
    const cleanupFunctions = [
      ...setupClaimsListeners(),
      ...setupAssistanceListeners(), 
      ...setupFarmersListeners(),
      ...setupInsuranceListeners()
    ];

    cleanupFunctionsRef.current = cleanupFunctions;

    // Cleanup on unmount
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
      cleanupFunctionsRef.current = [];
    };
  }, [
    initializeSocket,
    setupClaimsListeners,
    setupAssistanceListeners,
    setupFarmersListeners,
    setupInsuranceListeners
  ]);

  // Cleanup on user change
  useEffect(() => {
    if (user?.id) {
      const room = userType === 'admin' ? 'admin-room' : `farmer-${user.id}`;
      socketManager.joinRoom(room);
    }
  }, [user?.id, userType]);

  // Return socket utilities for components
  return {
    isConnected: socketManager.getConnectionStatus(),
    emit: socketManager.emit.bind(socketManager),
    joinRoom: socketManager.joinRoom.bind(socketManager),
    leaveRoom: socketManager.leaveRoom.bind(socketManager),
    socket: socketManager.getSocket()
  };
};

// Helper hook for manual cache updates
export const useSocketCacheUpdate = () => {
  const queryClient = useQueryClient();

  return useCallback((queryKey, updateFunction, options = {}) => {
    try {
      queryClient.setQueryData(queryKey, updateFunction);
      
      if (options.invalidate) {
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      console.error('Manual cache update error:', error);
    }
  }, [queryClient]);
};