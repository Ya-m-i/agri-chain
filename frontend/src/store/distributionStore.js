import { create } from 'zustand';
import { 
    getDistributionRecords, 
    getDistributionRecordsByFarmer, 
    getDistributionRecordsByStatus, 
    getDistributionRecordsStats,
    logClaimToDistribution 
} from '../api';

export const useDistributionStore = create((set, get) => ({
    // State
    records: [],
    stats: null,
    loading: false,
    error: null,
    searchTerm: '',
    statusFilter: 'all',
    farmerFilter: 'all',

    // Actions
    setSearchTerm: (term) => set({ searchTerm: term }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setFarmerFilter: (farmer) => set({ farmerFilter: farmer }),

    // Fetch all distribution records from blockchain
    fetchRecords: async () => {
        set({ loading: true, error: null });
        try {
            console.log('🔄 Fetching distribution records from blockchain...');
            const response = await getDistributionRecords();
            
            if (response.success) {
                set({ 
                    records: response.data || [], 
                    loading: false 
                });
                console.log('✅ Successfully fetched distribution records:', response.data?.length || 0);
            } else {
                throw new Error(response.message || 'Failed to fetch distribution records');
            }
        } catch (error) {
            console.error('❌ Error fetching distribution records:', error);
            set({ 
                error: error.message, 
                loading: false 
            });
        }
    },

    // Fetch records by farmer
    fetchRecordsByFarmer: async (farmerName) => {
        set({ loading: true, error: null });
        try {
            console.log(`🔄 Fetching distribution records for farmer: ${farmerName}`);
            const response = await getDistributionRecordsByFarmer(farmerName);
            
            if (response.success) {
                set({ 
                    records: response.data || [], 
                    loading: false 
                });
                console.log('✅ Successfully fetched farmer records:', response.data?.length || 0);
            } else {
                throw new Error(response.message || 'Failed to fetch farmer records');
            }
        } catch (error) {
            console.error('❌ Error fetching farmer records:', error);
            set({ 
                error: error.message, 
                loading: false 
            });
        }
    },

    // Fetch records by status
    fetchRecordsByStatus: async (status) => {
        set({ loading: true, error: null });
        try {
            console.log(`🔄 Fetching distribution records with status: ${status}`);
            const response = await getDistributionRecordsByStatus(status);
            
            if (response.success) {
                set({ 
                    records: response.data || [], 
                    loading: false 
                });
                console.log('✅ Successfully fetched status records:', response.data?.length || 0);
            } else {
                throw new Error(response.message || 'Failed to fetch status records');
            }
        } catch (error) {
            console.error('❌ Error fetching status records:', error);
            set({ 
                error: error.message, 
                loading: false 
            });
        }
    },

    // Fetch statistics
    fetchStats: async () => {
        set({ loading: true, error: null });
        try {
            console.log('🔄 Fetching distribution records statistics...');
            const response = await getDistributionRecordsStats();
            
            if (response.success) {
                set({ 
                    stats: response.data, 
                    loading: false 
                });
                console.log('✅ Successfully fetched statistics:', response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('❌ Error fetching statistics:', error);
            set({ 
                error: error.message, 
                loading: false 
            });
        }
    },

    // Log claim to distribution records (blockchain)
    logClaim: async (claimData) => {
        set({ loading: true, error: null });
        try {
            console.log('📝 Logging claim to distribution records (blockchain):', claimData);
            const response = await logClaimToDistribution(claimData);
            
            if (response.success) {
                console.log('✅ Successfully logged claim to distribution records');
                // Refresh records after logging
                await get().fetchRecords();
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to log claim');
            }
        } catch (error) {
            console.error('❌ Error logging claim:', error);
            set({ 
                error: error.message, 
                loading: false 
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Get filtered records
    getFilteredRecords: () => {
        const { records, searchTerm, statusFilter, farmerFilter } = get();
        
        return records.filter(record => {
            const matchesSearch = !searchTerm || 
                record.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.cropType?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
            const matchesFarmer = farmerFilter === 'all' || record.farmerName === farmerFilter;
            
            return matchesSearch && matchesStatus && matchesFarmer;
        });
    },

    // Get unique farmers for filter
    getUniqueFarmers: () => {
        const { records } = get();
        const farmers = [...new Set(records.map(record => record.farmerName).filter(Boolean))];
        return farmers.sort();
    }
}));
