import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight">
        ♻️ EcoTrack
      </Link>

      <div className="flex items-center gap-6">
        {user?.role === 'resident' && (
          <>
            <Link to="/resident/dashboard" className="hover:text-green-200 text-sm font-medium">Dashboard</Link>
            <Link to="/resident/post" className="hover:text-green-200 text-sm font-medium">Post Item</Link>
            <Link to="/resident/listings" className="hover:text-green-200 text-sm font-medium">My Listings</Link>
            <Link to="/resident/leaderboard" className="hover:text-green-200 text-sm font-medium">Leaderboard</Link>
          </>
        )}

        {user?.role === 'collector' && (
          <>
            <Link to="/collector/dashboard" className="hover:text-green-200 text-sm font-medium">Dashboard</Link>
            <Link to="/collector/browse" className="hover:text-green-200 text-sm font-medium">Browse Items</Link>
            <Link to="/collector/history" className="hover:text-green-200 text-sm font-medium">History</Link>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className="hover:text-green-200 text-sm font-medium">Dashboard</Link>
            <Link to="/admin/users" className="hover:text-green-200 text-sm font-medium">Users</Link>
            <Link to="/admin/collectors" className="hover:text-green-200 text-sm font-medium">Collectors</Link>
          </>
        )}

        <div className="flex items-center gap-3 ml-4 border-l border-green-500 pl-4">
          <span className="text-sm text-green-200">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar