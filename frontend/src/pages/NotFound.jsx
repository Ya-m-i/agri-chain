"use client"

import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-green-800">404</h1>
        <div className="w-full h-1 bg-green-500 my-6"></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <Home className="mr-2 h-5 w-5" /> Back to Home
        </button>
      </div>
    </div>
  )
}

export default NotFound
