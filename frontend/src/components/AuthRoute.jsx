import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const AuthRoute = ({ children, userType }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUserType = useAuthStore((state) => state.userType)

  // Support both string and array for userType
  const allowedUserTypes = Array.isArray(userType) ? userType : [userType]

  // Redirect if not authenticated or user type does not match
  if (!isAuthenticated || !currentUserType || !allowedUserTypes.includes(currentUserType)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthRoute
