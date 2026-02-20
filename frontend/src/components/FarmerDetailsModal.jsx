import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import RSBSAEnrollmentForm from "./RSBSAEnrollmentForm"

const FarmerDetailsModal = ({
  isOpen,
  onClose,
  farmer,
}) => {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !farmer) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isOpen, farmer])

  if (!isOpen || !farmer) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex flex-col p-4" style={{ height: "100vh" }}>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full py-6 flex flex-col items-center">
          <div className="w-[80%] max-w-6xl flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">RSBSA Farmer Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full border-2 border-black hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
          <RSBSAEnrollmentForm
            mode="view"
            initialData={farmer}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default FarmerDetailsModal
