const AssistanceFeedbackModal = ({
  isOpen,
  onClose,
  actionType,
  itemName,
  feedback,
  onFeedbackChange,
  onConfirm
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {actionType === 'approved' ? 'Approve' : 
           actionType === 'rejected' ? 'Reject' : 
           actionType === 'delete' ? 'Delete' : 'Action'} Application
        </h2>
        <p className="mb-4 text-gray-600">
          {actionType === 'delete' ? 
            `Are you sure you want to delete "${itemName}"? This action cannot be undone.` :
            `Are you sure you want to ${actionType} this assistance application? 
            Please provide feedback for the farmer.`
          }
        </p>
        {actionType !== 'delete' && (
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            rows={4}
            placeholder={`Enter feedback for the farmer (reason for ${actionType})`}
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
          />
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              actionType === 'approved'
                ? 'bg-green-600 hover:bg-green-700'
                : actionType === 'rejected'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {actionType === 'approved' ? 'Yes, Approve' : 
             actionType === 'rejected' ? 'Yes, Reject' : 
             'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssistanceFeedbackModal

