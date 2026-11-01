import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = {
    resident: [
      { to: '/resident/dashboard', label: 'Dashboard' },
      { to: '/resident/post', label: 'Post item' },
      { to: '/resident/listings', label: 'My listings' },
      { to: '/resident/leaderboard', label: 'Leaderboard' },
    ],
    collector: [
      { to: '/collector/dashboard', label: 'Dashboard' },
      { to: '/collector/browse', label: 'Browse items' },
      { to: '/collector/history', label: 'History' },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/collectors', label: 'Collectors' },
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/audit-logs', label: 'Audit logs' },
    ]
  }

  const navLinks = links[user?.role] || []

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <nav className="bg-forest px-6 py-3.5 sticky top-0 z-50">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">♻️</span>
          <span className="font-display text-lg font-semibold text-sage">EcoTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition
                ${location.pathname === link.to
                  ? 'bg-sage/15 text-sage'
                  : 'text-sage/65 hover:text-sage hover:bg-sage/10'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 pl-4 ml-2 border-l border-sage/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-clay/20 border border-clay/30 flex items-center justify-center text-clay text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden lg:block">
              <p className="text-sage text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-sage/50 text-xs leading-tight capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sage/70 hover:text-sage text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-sage/10 transition"
          >
            Log out
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden text-sage/80 hover:text-sage border border-sage/20 rounded-lg px-3 py-1.5 text-sm"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-sage/15 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition
                ${location.pathname === link.to
                  ? 'bg-sage/15 text-sage'
                  : 'text-sage/70 hover:text-sage hover:bg-sage/10'}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false)
              handleLogout()
            }}
            className="w-full text-left text-sm font-medium text-sage/70 hover:text-sage px-3 py-2 rounded-lg hover:bg-sage/10 transition"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
