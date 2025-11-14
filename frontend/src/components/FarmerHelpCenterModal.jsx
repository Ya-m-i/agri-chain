"use client"

import { useState } from "react"
import { X, Send, Upload, AlertCircle, FileText, HelpCircle, CheckCircle } from "lucide-react"
import { sendNotification } from "../api"
import { useAuthStore } from "../store/authStore"

const FarmerHelpCenterModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] = useState(null)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      
      // Check file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError("Only images (JPEG, PNG) and PDF files are allowed")
        return
      }

      setAttachment(file)
      setError("")

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAttachmentPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setAttachmentPreview(null)
      }
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required")
      setLoading(false)
      return
    }

    try {
      // Convert attachment to base64 if present
      let attachmentBase64 = null
      let attachmentName = null
      if (attachment) {
        attachmentBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result.split(',')[1]) // Remove data:image/...;base64, prefix
          }
          reader.onerror = reject
          reader.readAsDataURL(attachment)
        })
        attachmentName = attachment.name
      }

      // Create notification message with attachment info
      const notificationMessage = attachment
        ? `${message}\n\n[Attachment: ${attachmentName}]\n[File Type: ${attachment.type}]\n[File Size: ${(attachment.size / 1024).toFixed(2)} KB]`
        : message

      // Send notification to admin
      await sendNotification({
        recipientType: 'admin',
        recipientId: null, // Admin notifications don't need recipientId
        type: 'info',
        title: `Help Request from ${user?.name || user?.username || 'Farmer'}: ${subject}`,
        message: notificationMessage,
        relatedEntityType: 'general',
        // Store attachment data in relatedEntityId as JSON string (temporary solution)
        // In production, you might want to store attachments separately
        relatedEntityId: attachmentBase64 ? JSON.stringify({
          fileName: attachmentName,
          fileType: attachment.type,
          fileSize: attachment.size,
          fileData: attachmentBase64
        }) : null
      })

      setSuccess("Your help request has been sent to the admin. We'll get back to you soon!")
      
      // Reset form
      setSubject("")
      setMessage("")
      setAttachment(null)
      setAttachmentPreview(null)

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess("")
      }, 2000)
    } catch (error) {
      console.error("Error sending help request:", error)
      setError(error.message || "Failed to send help request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSubject("")
    setMessage("")
    setAttachment(null)
    setAttachmentPreview(null)
    setError("")
    setSuccess("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-lime-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 text-white p-6 flex justify-between items-center shadow-lg">
          <div className="flex items-center">
            <HelpCircle className="mr-3" size={24} />
            <h2 className="text-xl font-bold">Help Center</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Need assistance? Send us a message and we'll help you as soon as possible. You can attach an invoice or document if needed.
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
                maxLength={100}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                rows={6}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-lime-50 border-2 border-lime-200 rounded-lg cursor-pointer hover:bg-lime-100 transition-colors">
                    <Upload size={18} className="text-lime-600" />
                    <span className="text-sm font-medium text-lime-700">Choose File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {attachment && (
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                {attachment && (
                  <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(2)} KB • {attachment.type}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {attachmentPreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <img
                      src={attachmentPreview}
                      alt="Preview"
                      className="max-w-full max-h-48 rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, PDF (Max size: 5MB)
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <CheckCircle className="text-green-600 mr-2" size={20} />
                <p className="text-green-600 font-medium">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className="flex-1 bg-lime-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-lime-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FarmerHelpCenterModal

