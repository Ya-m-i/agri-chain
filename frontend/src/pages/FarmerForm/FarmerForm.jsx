"use client"

import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useClaimFormStore } from "../../store/claimFormStore"
import FormNavigation from "./FormNavigation"
import FormStep1 from "./FormStep1"
import FormStep2 from "./FormStep2"
import FormStep3 from "./FormStep3"

const FarmerForm = () => {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const { step, setStep, validateStep, submitForm, isSubmitting } = useClaimFormStore()

  const handleClose = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will be saved.")) {
      navigate("/farmer-dashboard")
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      // Scroll to top when changing steps
      window.scrollTo(0, 0)
      if (formRef.current) {
        formRef.current.scrollTop = 0
      }
    }
  }

  const handleSubmit = async () => {
    try {
      console.log('FarmerForm: Starting claim submission...');
      console.log('FarmerForm: User agent:', navigator.userAgent);
      console.log('FarmerForm: Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      
      await submitForm()
      console.log('FarmerForm: Claim submitted successfully!');
      toast.success("Claim submitted successfully!")
      navigate("/farmer-dashboard")
    } catch (error) {
      console.error("FarmerForm: Submission error:", error);
      console.error("FarmerForm: Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(typeof error === "string" ? error : "Failed to submit claim. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-green-100 to-green-200 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl p-8 relative" ref={formRef}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none"
          aria-label="Close form"
        >
          ×
        </button>

        <h1 className="text-5xl font-extrabold text-center text-green-800 mb-12 flex items-center justify-center gap-4">
          <span className="text-green-600">🚜</span> Claim for Indemnity
        </h1>

        <FormNavigation />

        {step === 1 && <FormStep1 />}
        {step === 2 && <FormStep2 />}
        {step === 3 && <FormStep3 />}

        <div className="mt-12 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-xl"
            >
              Back
            </button>
          )}

          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-xl"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-xl flex items-center ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerForm
