import { Calendar } from "lucide-react"

const ClaimStatusConfirmationModal = ({
  isOpen,
  onClose,
  actionType,
  feedbackText,
  onFeedbackChange,
  paymentDate,
  onPaymentDateChange,
  onConfirm
}) => {
  if (!isOpen) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
        <div className="bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl">
          <h3 className="text-2xl font-bold text-black">
            {actionType === "approved" ? "✅ Approve Claim" : "❌ Reject Claim"}
          </h3>
        </div>
        <div className="p-6 bg-white">
          <p className="mb-6 text-black text-center">
            Are you sure you want to {actionType === "approved" ? "approve" : "reject"} this claim? This action cannot be undone.
          </p>
          
          {actionType === "approved" && (
            <div className="mb-4 p-4 bg-lime-50 border-2 border-lime-500 rounded-lg">
              <label htmlFor="paymentDate" className="block text-sm font-bold text-black mb-2 uppercase flex items-center gap-2">
                <Calendar size={16} className="text-lime-600" />
                Set Payment Date for Farmer
              </label>
              <input
                type="date"
                id="paymentDate"
                value={paymentDate || today}
                min={today}
                onChange={(e) => onPaymentDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 text-black font-semibold"
              />
              <p className="text-xs text-gray-600 mt-2">
                The farmer will be notified when this date arrives. You will also receive a notification on this date.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-sm font-bold text-black mb-2 uppercase">
              Feedback (optional)
            </label>
            <textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => onFeedbackChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 text-black"
              rows={3}
              placeholder="Add feedback for the farmer..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t-2 border-black">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-all font-bold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-3 rounded-lg text-white font-bold border-2 transition-all shadow-lg ${
                actionType === "approved"
                  ? "bg-lime-600 hover:bg-lime-700 border-lime-700"
                  : "bg-red-600 hover:bg-red-700 border-red-700"
              }`}
              style={actionType === "approved" ? { boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' } : {}}
            >
              {actionType === "approved" ? "Yes, Approve" : "Yes, Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimStatusConfirmationModal

