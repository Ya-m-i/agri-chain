import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useAuthStore } from "./authStore"
// Note: Notifications are now handled by backend API
import { createClaim, fetchClaims } from '../api';

export const useClaimFormStore = create(
  persist(
    (set, get) => ({
      step: 1,
      formData: {
        name: "",
        address: "",
        phone: "",
        farmerLocation: "",
        crop: "",
        otherCropText: "",
        areaInsured: "",
        varietyPlanted: "",
        plantingDate: "",
        cicNumber: "",
        underwriter: "",
        program: [],
        otherProgramText: "",
        damageType: "",
        lossDate: "",
        ageStage: "",
        areaDamaged: "",
        degreeOfDamage: "",
        expectedHarvest: "",
        damagePhotos: [],
        lotBoundaries: {
          1: { north: "", south: "", east: "", west: "" },
          2: { north: "", south: "", east: "", west: "" },
          3: { north: "", south: "", east: "", west: "" },
          4: { north: "", south: "", east: "", west: "" },
        },
        errors: {},
        touched: {},
      },
      isSubmitting: false,
      submittedClaims: [],

      setStep: (step) => set(() => ({ step })),

      updateForm: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value,
            errors: {
              ...state.formData.errors,
              [field]: undefined,
            },
          },
        })),

      updateLotBoundary: (lot, direction, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            lotBoundaries: {
              ...state.formData.lotBoundaries,
              [lot]: {
                ...state.formData.lotBoundaries[lot],
                [direction]: value,
              },
            },
          },
        })),

      addDamagePhoto: (files) =>
        set((state) => ({
          formData: {
            ...state.formData,
            damagePhotos: [...state.formData.damagePhotos, ...files],
          },
        })),

      removeDamagePhoto: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            damagePhotos: state.formData.damagePhotos.filter((_, i) => i !== index),
          },
        })),

      resetForm: () =>
        set(() => ({
          step: 1,
          formData: {
            name: "",
            address: "",
            phone: "",
            farmerLocation: "",
            crop: "",
            otherCropText: "",
            areaInsured: "",
            varietyPlanted: "",
            plantingDate: "",
            cicNumber: "",
            underwriter: "",
            program: [],
            otherProgramText: "",
            damageType: "",
            lossDate: "",
            ageStage: "",
            areaDamaged: "",
            degreeOfDamage: "",
            expectedHarvest: "",
            damagePhotos: [],
            lotBoundaries: {
              1: { north: "", south: "", east: "", west: "" },
              2: { north: "", south: "", east: "", west: "" },
              3: { north: "", south: "", east: "", west: "" },
              4: { north: "", south: "", east: "", west: "" },
            },
            errors: {},
            touched: {},
          },
        })),

      validateStep: (step) => {
        const { formData } = get()
        const errors = {}

        if (step === 1) {
          if (!formData.name) errors.name = "Name is required"
          if (!formData.address) errors.address = "Address is required"
          if (!formData.phone) errors.phone = "Phone number is required"
          if (!formData.crop) errors.crop = "Crop type is required"
          if (formData.crop === "Other" && !formData.otherCropText) {
            errors.otherCropText = "Please specify the crop type"
          }
          if (!formData.areaInsured) errors.areaInsured = "Area insured is required"
        }

        if (step === 2) {
          if (!formData.damageType) errors.damageType = "Cause of loss is required"
          if (!formData.lossDate) errors.lossDate = "Date of loss is required"
          if (!formData.ageStage) errors.ageStage = "Age/Stage is required"
          if (!formData.areaDamaged) errors.areaDamaged = "Area damaged is required"
          if (!formData.degreeOfDamage) errors.degreeOfDamage = "Degree of damage is required"
          if (!formData.damagePhotos || formData.damagePhotos.length === 0) {
            errors.damagePhotos = "At least one damage photo is required"
          }
        }

        set((state) => ({
          formData: {
            ...state.formData,
            errors,
          },
        }))

        return Object.keys(errors).length === 0
      },

      setFieldTouched: (field) => {
        set((state) => ({
          formData: {
            ...state.formData,
            touched: {
              ...state.formData.touched,
              [field]: true,
            },
          },
        }))
      },

      submitForm: async () => {
        set({ isSubmitting: true })
        try {
          console.log('ClaimFormStore: Starting form submission...');
          console.log('ClaimFormStore: User agent:', navigator.userAgent);
          console.log('ClaimFormStore: Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
          
          const { formData } = get()
          const user = useAuthStore.getState().user
          
          if (!user) {
            throw new Error('User not authenticated. Please login again.');
          }
          
          console.log('ClaimFormStore: User data:', user);
          console.log('ClaimFormStore: Form data:', formData);
          
          // Validate required fields
          if (!formData.crop) {
            throw new Error('Crop type is required');
          }
          
          if (!formData.areaDamaged || parseFloat(formData.areaDamaged) <= 0) {
            throw new Error('Area damaged must be greater than 0');
          }
          
          if (!formData.degreeOfDamage || parseFloat(formData.degreeOfDamage) <= 0) {
            throw new Error('Degree of damage must be greater than 0');
          }
          
          // Convert photos to data URLs for mobile compatibility
          const convertPhotosToDataUrls = async (photos) => {
            const dataUrls = [];
            for (const photo of photos) {
              if (photo instanceof File) {
                try {
                  const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(photo);
                  });
                  dataUrls.push(dataUrl);
                } catch {
                  dataUrls.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
                }
              } else if (typeof photo === 'string' && photo.startsWith('data:')) {
                dataUrls.push(photo);
              } else {
                dataUrls.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
              }
            }
            return dataUrls;
          };

          const damagePhotosDataUrls = await convertPhotosToDataUrls(formData.damagePhotos);
          console.log('ClaimFormStore: Converted photos count:', damagePhotosDataUrls.length);

          // Prepare claim data for backend
          const newClaim = {
            farmerId: user.id,
            name: user.name,
            address: user.address,
            phone: user.phone,
            crop: formData.crop === "Other" ? formData.otherCropText : formData.crop,
            areaInsured: parseFloat(formData.areaInsured) || 0,
            program: formData.program,
            varietyPlanted: formData.varietyPlanted,
            plantingDate: formData.plantingDate ? new Date(formData.plantingDate).toISOString() : null,
            cicNumber: formData.cicNumber,
            underwriter: formData.underwriter,
            damageType: formData.damageType,
            lossDate: formData.lossDate ? new Date(formData.lossDate).toISOString() : null,
            ageStage: formData.ageStage,
            areaDamaged: parseFloat(formData.areaDamaged) || 0,
            degreeOfDamage: parseFloat(formData.degreeOfDamage) || 0,
            expectedHarvest: formData.expectedHarvest,
            damagePhotos: damagePhotosDataUrls,
            lotBoundaries: formData.lotBoundaries,
            status: "pending",
            date: new Date().toISOString(),
            reviewDate: null,
            completionDate: null,
          }

          console.log('ClaimFormStore: Submitting claim with data:', newClaim);

          // Send to backend
          const result = await createClaim(newClaim)
          console.log('ClaimFormStore: Claim submission result:', result);
          
          // Extract claimNumber from result (handle different response formats)
          let claimNumber;
          let claimId;
          
          console.log('ClaimFormStore: Raw backend response:', JSON.stringify(result, null, 2));
          
          // Try multiple ways to extract claimNumber
          if (result.claimNumber) {
            claimNumber = result.claimNumber;
          } else if (result.data && result.data.claimNumber) {
            claimNumber = result.data.claimNumber;
          } else if (result.claim && result.claim.claimNumber) {
            claimNumber = result.claim.claimNumber;
          } else {
            console.warn('ClaimFormStore: claimNumber not found in expected locations, using fallback');
            claimNumber = 'Unknown';
          }
          
          // Try multiple ways to extract ID
          if (result._id) {
            claimId = result._id;
          } else if (result.data && result.data._id) {
            claimId = result.data._id;
          } else if (result.claim && result.claim._id) {
            claimId = result.claim._id;
          } else {
            claimId = null;
          }
          
          console.log('ClaimFormStore: Extracted claimNumber:', claimNumber);
          console.log('ClaimFormStore: Extracted claimId:', claimId);
          
          set({ isSubmitting: false })
          get().resetForm()
          
          // Add notification for successful claim submission
          if (user && user.id) {
            // Note: Notifications are now created by backend API automatically
            console.log('Claim submitted successfully');
          }
          
          // Trigger immediate refresh of claims in farmer dashboard
          // This will help with real-time updates across devices
          setTimeout(() => {
            // Dispatch a custom event to notify other components
            window.dispatchEvent(new CustomEvent('claimSubmitted', { 
              detail: { 
                claimId: claimId,
                claimNumber: claimNumber,
                crop: newClaim.crop 
              } 
            }));
          }, 1000);
          
          return Promise.resolve()
        } catch (error) {
          console.error('ClaimFormStore: Claim submission error:', error);
          console.error('ClaimFormStore: Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          set({ isSubmitting: false })
          return Promise.reject(error.message || 'Failed to submit claim')
        }
      },

      getClaimsForFarmer: async (farmerId) => {
        try {
          return await fetchClaims(farmerId)
        } catch {
          return []
        }
      },

      getClaims: async () => {
        try {
          return await fetchClaims()
        } catch {
          return []
        }
      },

      updateClaimStatus: (claimId, newStatus, feedback, compensation) => {
        set((state) => ({
          submittedClaims: state.submittedClaims.map((claim) =>
            claim.id === claimId
              ? { ...claim, status: newStatus, adminFeedback: feedback, compensation }
              : claim
          ),
        }));
      },
    }),
    {
      name: "claim-form-storage",
      partialize: (state) => {
        const { formData, step, submittedClaims } = state
        return {
          step,
          submittedClaims,
          formData: {
            ...formData,
            damagePhotos: [],
            errors: {},
            touched: {},
          },
        }
      },
    },
  ),
)
