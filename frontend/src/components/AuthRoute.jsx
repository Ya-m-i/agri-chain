import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const AuthRoute = ({ children, userType }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUserType = useAuthStore((state) => state.userType)

  // Redirect if not authenticated or user type does not match
  if (!isAuthenticated || !currentUserType || currentUserType !== userType) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthRoute
