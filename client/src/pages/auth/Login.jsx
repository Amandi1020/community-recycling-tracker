import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../../utils/axios'
import { useAuth } from '../../context/AuthContext'
import heroLogin from '../../assets/illustrations/hero-login.jpeg'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/auth/login', formData)
      login(res.data.user, res.data.token)
      if (res.data.user.role === 'admin') navigate('/admin/dashboard')
      else if (res.data.user.role === 'collector') navigate('/collector/dashboard')
      else navigate('/resident/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        {/* Mobile top image strip — visible only on small screens */}
        <div className="lg:hidden w-full h-70 bg-forest relative overflow-hidden flex-shrink-0">
          <img
            src={heroLogin}
            alt="EcoTrack illustration"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-forest/40"></div>
          <div className="absolute top-4 left-5 flex items-center gap-2 z-10">
            <span className="text-2xl">♻️</span>
            <span className="font-display text-xl font-semibold text-white drop-shadow-md">EcoTrack</span>
          </div>
        </div>
        
        {/* Desktop left panel — full image, hidden on mobile */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src={heroLogin}
            alt="Person recycling illustration"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
            <span className="text-3xl">♻️</span>
            <span className="font-display text-2xl font-semibold text-white drop-shadow-md">EcoTrack</span>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 bg-forest flex items-center justify-center p-8 sm:p-14">
          <div className="w-full max-w-sm">

            <h2 className="font-display text-4xl font-medium text-sage mb-8 tracking-wide">Login</h2>

            {error && (
              <div className="bg-clay/15 text-clay border border-clay/30 px-4 py-3 rounded-full mb-5 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sage/70 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-moss/30 border border-sage/20 rounded-full pl-11 pr-4 py-3 text-sage placeholder-sage/40 focus:outline-none focus:ring-2 focus:ring-sage/40 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage/70 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-moss/30 border border-sage/20 rounded-full pl-11 pr-4 py-3 text-sage placeholder-sage/40 focus:outline-none focus:ring-2 focus:ring-sage/40 transition"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage hover:bg-sage/90 text-forest font-semibold py-3 rounded-full transition duration-200 mt-2"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-sm text-sage/60 mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-sage font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login