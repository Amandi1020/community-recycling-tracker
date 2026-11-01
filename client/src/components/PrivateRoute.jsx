import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const PrivateRoute = ({ children, role }) => {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream flex items-center justify-center">
        <p className="text-moss text-sm font-medium animate-pulse">Loading your session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

export default PrivateRoute
