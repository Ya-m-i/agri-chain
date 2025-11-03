import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

const ClaimStatusTracker = ({ status, claimId, submittedDate, reviewDate, completionDate, notes }) => {
  const steps = [
    { id: "submitted", label: "Submitted", icon: <Clock className="h-6 w-6" /> },
    { id: "under-review", label: "Under Review", icon: <AlertTriangle className="h-6 w-6" /> },
    { id: "approved", label: "Approved", icon: <CheckCircle className="h-6 w-6" /> },
    { id: "rejected", label: "Rejected", icon: <XCircle className="h-6 w-6" /> },
  ]

  // Determine the current step index
  const currentStepIndex = steps.findIndex((step) => step.id === status)

  // For rejected claims, we want to show a different flow
  const isRejected = status === "rejected"

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-black">Claim Status</h2>
        <span className="text-sm text-gray-600">Claim ID: {claimId}</span>
      </div>

      {/* Status Steps */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 h-full w-1 bg-gray-200 z-0"
          style={{ left: "1.25rem", transform: "translateX(-50%)" }}
        ></div>

        <div className="space-y-8 relative z-10">
          {steps.map((step, index) => {
            // Skip the rejected step if the claim is approved
            if (step.id === "rejected" && status === "approved") return null

            // Skip the approved step if the claim is rejected
            if (step.id === "approved" && status === "rejected") return null

            // Determine if this step is active, completed, or upcoming
            const isActive = index === currentStepIndex
            const isCompleted =
              index < currentStepIndex ||
              (isRejected && step.id === "rejected") ||
              (!isRejected && step.id === "approved" && status === "approved")

            return (
              <div key={step.id} className="flex items-start">
                <div
                  className={`rounded-full p-2 flex-shrink-0 ${
                    isActive
                      ? "bg-yellow-500 text-white"
                      : isCompleted
                        ? step.id === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>

                <div className="ml-4">
                  <h3
                    className={`font-semibold ${
                      isActive
                        ? "text-yellow-700"
                        : isCompleted
                          ? step.id === "rejected"
                            ? "text-red-700"
                            : "text-green-700"
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {step.id === "submitted" && submittedDate}
                    {step.id === "under-review" && (isCompleted || isActive) && (reviewDate || "In progress")}
                    {(step.id === "approved" || step.id === "rejected") &&
                      (isCompleted || isActive) &&
                      (completionDate || "Processing")}
                  </p>

                  {isActive && notes && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">{notes}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <h4 className="font-medium text-black mb-2">What happens next?</h4>
        {status === "submitted" && (
          <p className="text-sm text-gray-700">
            Your claim has been submitted and is waiting to be reviewed by our team. This typically takes 1-2 business
            days.
          </p>
        )}
        {status === "under-review" && (
          <p className="text-sm text-gray-700">
            Our team is currently reviewing your claim. We may contact you if additional information is needed. This
            process typically takes 3-5 business days.
          </p>
        )}
        {status === "approved" && (
          <p className="text-sm text-gray-700">
            Your claim has been approved! The compensation will be processed within 7 business days and sent to your
            registered account.
          </p>
        )}
        {status === "rejected" && (
          <p className="text-sm text-gray-700">
            Unfortunately, your claim has been rejected. Please review the notes above for the reason. You may submit a
            new claim or contact our support team for assistance.
          </p>
        )}
      </div>
    </div>
  )
}

export default ClaimStatusTracker
