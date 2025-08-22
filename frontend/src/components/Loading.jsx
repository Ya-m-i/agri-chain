import { Loader2 } from "lucide-react"

const Loading = () => {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-green-700 animate-spin" />
      <p className="mt-4 text-green-800 font-medium">Loading...</p>
    </div>
  )
}

export default Loading
