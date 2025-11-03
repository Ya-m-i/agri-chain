const ClaimStatusConfirmationModal = ({
  isOpen,
  onClose,
  actionType,
  feedbackText,
  onFeedbackChange,
  onConfirm
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {actionType === "approved" ? "Approve Claim" : "Reject Claim"}
        </h3>
        <p className="mb-4 text-gray-600">
          Are you sure you want to {actionType === "approved" ? "approve" : "reject"} this claim? This action cannot be undone.
        </p>
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
            Feedback (optional)
          </label>
          <textarea
            id="feedback"
            value={feedbackText}
            onChange={(e) => onFeedbackChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
            rows={3}
            placeholder="Add feedback for the farmer..."
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${
              actionType === "approved"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {actionType === "approved" ? "Yes, Approve" : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClaimStatusConfirmationModal

