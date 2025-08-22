import { create } from 'zustand'
import { 
  fetchAssistances, 
  createAssistance, 
  applyForAssistance, 
  getFarmerApplications, 
  getAllApplications, 
  updateApplicationStatus, 
  updateInventory,
  deleteAssistance
} from '../api'

const useAssistanceStore = create((set, get) => ({
  assistanceItems: [],
  farmerApplications: [],
  allApplications: [],
  loading: false,
  error: null,

  // Fetch assistance items from MongoDB
  initAssistanceItems: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Store: Initializing assistance items');
      const items = await fetchAssistances();
      console.log('Store: Assistance items initialized:', items.length);
      set({ assistanceItems: items, loading: false });
    } catch (error) {
      console.error('Store: Error initializing assistance items:', error);
      set({ assistanceItems: [], loading: false, error: error.message });
    }
  },

  // Add new assistance item to MongoDB
  addAssistanceItem: async (item) => {
    try {
      set({ loading: true, error: null });
      const newItem = await createAssistance(item);
      
      // Refresh the list from backend
      const items = await fetchAssistances();
      set({ assistanceItems: items, loading: false });
      
      return newItem;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Apply for assistance (Seed Assistance Flow)
  applyForAssistance: async (applicationData) => {
    try {
      set({ loading: true, error: null });
      const result = await applyForAssistance(applicationData);
      
      // Refresh farmer's applications
      if (applicationData.farmerId) {
        const applications = await getFarmerApplications(applicationData.farmerId);
        set({ farmerApplications: applications });
      }
      
      set({ loading: false });
      return result;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Get farmer's applications
  getFarmerApplications: async (farmerId) => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching applications for farmer ID:', farmerId);
      const applications = await getFarmerApplications(farmerId);
      console.log('Applications fetched:', applications);
      set({ farmerApplications: applications, loading: false });
      return applications;
    } catch (error) {
      console.error('Error fetching farmer applications:', error);
      set({ farmerApplications: [], loading: false, error: error.message });
      throw error;
    }
  },

  // Get all applications (for admin)
  getAllApplications: async () => {
    try {
      set({ loading: true, error: null });
      const applications = await getAllApplications();
      set({ allApplications: applications, loading: false });
      return applications;
    } catch (error) {
      set({ allApplications: [], loading: false, error: error.message });
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, statusData) => {
    try {
      set({ loading: true, error: null });
      const result = await updateApplicationStatus(applicationId, statusData);
      
      // Refresh applications
      const applications = await getAllApplications();
      set({ allApplications: applications, loading: false });
      
      return result;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Update inventory
  updateInventory: async (assistanceId, inventoryData) => {
    try {
      set({ loading: true, error: null });
      const result = await updateInventory(assistanceId, inventoryData);
      
      // Refresh assistance items
      const items = await fetchAssistances();
      set({ assistanceItems: items, loading: false });
      
      return result;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Check if farmer has already availed assistance this quarter
  hasAvailedThisQuarter: (farmerId, assistanceId) => {
    const { farmerApplications } = get();
    const now = new Date();
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
    
    return farmerApplications.some(app => 
      app.farmerId === farmerId && 
      app.assistanceId === assistanceId && 
      app.quarter === currentQuarter &&
      ['pending', 'approved', 'distributed'].includes(app.status)
    );
  },

  // Check eligibility for assistance
  checkEligibility: (farmer, assistance) => {
    const { farmerApplications } = get();
    const now = new Date();
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
    
    // Check if already applied this quarter
    const alreadyApplied = farmerApplications.some(app => 
      app.farmerId === farmer.id && 
      app.assistanceId === assistance._id && 
      app.quarter === currentQuarter &&
      ['pending', 'approved', 'distributed'].includes(app.status)
    );

    // Check crop type match (supports insuredCropTypes array or single cropType)
    const farmerCrops = (farmer.insuredCropTypes && Array.isArray(farmer.insuredCropTypes) && farmer.insuredCropTypes.length > 0)
      ? farmer.insuredCropTypes.map(c => String(c).toLowerCase())
      : (farmer.cropType ? [String(farmer.cropType).toLowerCase()] : []);
    const cropTypeMatch = Boolean(
      assistance.cropType && farmerCrops.length > 0 &&
      farmerCrops.includes(String(assistance.cropType).toLowerCase())
    );

    // Check RSBSA registration
    const rsbsaEligible = !assistance.requiresRSBSA || farmer.rsbsaRegistered;

    // Check certification (for cash assistance)
    const certificationEligible = !assistance.requiresCertification || farmer.isCertified;

    // Check stock availability
    const stockAvailable = assistance.availableQuantity > 0;

    return {
      eligible: !alreadyApplied && cropTypeMatch && rsbsaEligible && certificationEligible && stockAvailable,
      alreadyApplied,
      cropTypeMatch,
      rsbsaEligible,
      certificationEligible,
      stockAvailable,
      reasons: {
        alreadyApplied: alreadyApplied ? 'Already applied this quarter' : null,
        cropTypeMismatch: !cropTypeMatch ? `Only for ${assistance.cropType} farmers` : null,
        rsbsaRequired: !rsbsaEligible ? 'RSBSA registration required' : null,
        certificationRequired: !certificationEligible ? 'Certification required' : null,
        outOfStock: !stockAvailable ? 'Out of stock' : null
      }
    };
  },
  
  setAssistanceItems: (items) => {
    set({ assistanceItems: items })
  },
  
  updateAssistanceItem: (index, updatedItem) => {
    set((state) => {
      const newItems = state.assistanceItems.map((item, i) => 
        i === index ? updatedItem : item
      )
      return { assistanceItems: newItems }
    })
  },
  
  deleteAssistanceItem: async (assistanceId) => {
    try {
      set({ loading: true, error: null });
      await deleteAssistance(assistanceId);
      
      // Refresh assistance items
      const items = await fetchAssistances();
      set({ assistanceItems: items, loading: false });
      
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}))

export default useAssistanceStore 