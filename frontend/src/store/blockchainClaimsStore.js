import { create } from 'zustand';
import { 
    getBlockchainClaims, 
    createBlockchainClaim, 
    updateBlockchainClaim,
    getBlockchainClaimsStats,
    getBlockchainClaimsByFarmer,
    getBlockchainClaimsByStatus
} from '../api';

const useBlockchainClaimsStore = create((set, get) => ({
    claimsLogs: [],
    stats: null,
    loading: false,
    error: null,

    // Fetch all claims logs from blockchain
    fetchClaimsLogs: async () => {
        try {
            set({ loading: true, error: null });
            console.log('🔄 Fetching claims logs from blockchain...');
            const response = await getBlockchainClaims();
            
            if (response.success) {
                set({ 
                    claimsLogs: response.data, 
                    loading: false 
                });
                console.log('✅ Successfully fetched claims logs from blockchain:', response.data.length);
            } else {
                throw new Error(response.message || 'Failed to fetch claims logs');
            }
        } catch (error) {
            console.error('❌ Error fetching claims logs:', error);
            set({ 
                claimsLogs: [], 
                loading: false, 
                error: error.message 
            });
        }
    },

    // Create new claims log in blockchain
    createClaimsLog: async (claimLogData) => {
        try {
            set({ loading: true, error: null });
            console.log('📝 Creating claims log in blockchain...');
            const response = await createBlockchainClaim(claimLogData);
            
            if (response.success) {
                // Refresh the list
                await get().fetchClaimsLogs();
                console.log('✅ Successfully created claims log in blockchain');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create claims log');
            }
        } catch (error) {
            console.error('❌ Error creating claims log:', error);
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    // Update claims log in blockchain
    updateClaimsLog: async (id, claimLogData) => {
        try {
            set({ loading: true, error: null });
            console.log(`📝 Updating claims log ${id} in blockchain...`);
            const response = await updateBlockchainClaim(id, claimLogData);
            
            if (response.success) {
                // Refresh the list
                await get().fetchClaimsLogs();
                console.log('✅ Successfully updated claims log in blockchain');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update claims log');
            }
        } catch (error) {
            console.error('❌ Error updating claims log:', error);
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    // Fetch claims logs statistics from blockchain
    fetchClaimsLogsStats: async () => {
        try {
            set({ loading: true, error: null });
            console.log('📊 Fetching claims logs statistics from blockchain...');
            const response = await getBlockchainClaimsStats();
            
            if (response.success) {
                set({ 
                    stats: response.data, 
                    loading: false 
                });
                console.log('✅ Successfully fetched claims logs statistics from blockchain');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch claims logs statistics');
            }
        } catch (error) {
            console.error('❌ Error fetching claims logs statistics:', error);
            set({ 
                stats: null, 
                loading: false, 
                error: error.message 
            });
        }
    },

    // Fetch claims logs by farmer from blockchain
    fetchClaimsLogsByFarmer: async (farmerId) => {
        try {
            set({ loading: true, error: null });
            console.log(`🔍 Fetching claims logs for farmer ${farmerId} from blockchain...`);
            const response = await getBlockchainClaimsByFarmer(farmerId);
            
            if (response.success) {
                set({ loading: false });
                console.log('✅ Successfully fetched farmer claims logs from blockchain');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch farmer claims logs');
            }
        } catch (error) {
            console.error('❌ Error fetching farmer claims logs:', error);
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    // Fetch claims logs by status from blockchain
    fetchClaimsLogsByStatus: async (status) => {
        try {
            set({ loading: true, error: null });
            console.log(`🔍 Fetching claims logs with status ${status} from blockchain...`);
            const response = await getBlockchainClaimsByStatus(status);
            
            if (response.success) {
                set({ loading: false });
                console.log('✅ Successfully fetched status claims logs from blockchain');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch status claims logs');
            }
        } catch (error) {
            console.error('❌ Error fetching status claims logs:', error);
            set({ loading: false, error: error.message });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Set loading state
    setLoading: (loading) => set({ loading }),

    // Get log by ID
    getLogById: (id) => {
        const { claimsLogs } = get();
        return claimsLogs.find(log => log.id === id);
    },

    // Filter logs by status
    getLogsByStatus: (status) => {
        const { claimsLogs } = get();
        return claimsLogs.filter(log => log.status === status);
    },

    // Filter logs by farmer
    getLogsByFarmer: (farmerId) => {
        const { claimsLogs } = get();
        return claimsLogs.filter(log => log.farmerId === farmerId);
    }
}));

export default useBlockchainClaimsStore;
