"use client"

import { useClaimFormStore } from "../../store/claimFormStore"

const FormNavigation = () => {
  const { step, setStep } = useClaimFormStore()
  const progressPercentage = (step / 3) * 100

  return (
    <>
      <div className="w-full bg-gray-300 rounded-full h-4 mb-8">
        <div
          className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-around items-center mb-8">
        {[1, 2, 3].map((navStep) => (
          <button
            key={navStep}
            onClick={() => setStep(navStep)}
            className={`px-6 py-3 rounded-full shadow-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 ${
              step === navStep
                ? "bg-green-700 text-white transform scale-105"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Step {navStep}
          </button>
        ))}
      </div>
    </>
  )
}

export default FormNavigation
