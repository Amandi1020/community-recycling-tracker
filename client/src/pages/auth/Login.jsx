import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../../utils/axios'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
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

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (res.data.user.role === 'collector') {
        navigate('/collector/dashboard')
      } else {
        navigate('/resident/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest relative overflow-hidden flex-col justify-between p-12">
        {/* Organic blob shape */}
        <svg className="absolute -right-32 -top-32 w-[500px] h-[500px] opacity-90" viewBox="0 0 200 200">
          <path fill="#3D7A5C" d="M45.3,-58.5C58.6,-49.5,69.2,-35.4,73.8,-19.5C78.4,-3.7,77,13.9,69.5,28.4C62,42.9,48.4,54.2,33.2,61.6C17.9,69,1,72.5,-16.5,71.2C-34,69.9,-52.1,63.8,-63.6,51.2C-75.1,38.6,-80,19.3,-78.7,1C-77.4,-17.4,-69.9,-34.8,-57.6,-44.4C-45.3,-54.1,-28.2,-56,-11.7,-58.6C4.9,-61.2,32,-67.5,45.3,-58.5Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -left-20 bottom-0 w-72 h-72 opacity-40" viewBox="0 0 200 200">
          <path fill="#D97B4A" d="M39.5,-50.6C50.6,-41.6,58.7,-28.9,61.8,-14.8C64.9,-0.7,63,15.8,55.4,28.9C47.8,42,34.5,51.7,19.7,57.2C4.9,62.7,-11.4,64,-26.2,59.3C-41,54.6,-54.3,43.9,-61.4,30C-68.5,16.1,-69.4,-1,-64.5,-15.8C-59.6,-30.6,-48.9,-43.1,-36,-51.8C-23.1,-60.5,-7.9,-65.4,5.6,-72.1C19.1,-78.8,28.4,-59.6,39.5,-50.6Z" transform="translate(100 100)" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <span className="font-display text-2xl font-semibold text-sage">EcoTrack</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-medium text-sage leading-tight mb-4">
            Recycling,<br />reimagined for<br />your community.
          </h1>
          <p className="text-sage/70 text-base max-w-sm">
            Post what you no longer need. Earn points for what you give away. Watch your district grow greener together.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-sage/80 text-sm">
          <div>
            <p className="font-display text-2xl text-sage">5</p>
            <p>Categories</p>
          </div>
          <div>
            <p className="font-display text-2xl text-sage">25</p>
            <p>Districts</p>
          </div>
          <div>
            <p className="font-display text-2xl text-sage">4</p>
            <p>Levels to earn</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="text-2xl">♻️</span>
            <span className="font-display text-xl font-semibold text-forest">EcoTrack</span>
          </div>

          <h2 className="font-display text-3xl font-medium text-charcoal mb-2">Welcome back</h2>
          <p className="text-charcoal/60 text-sm mb-8">Log in to track your recycling impact</p>

          {error && (
            <div className="bg-clay/10 text-clay border border-clay/20 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest hover:bg-forest/90 text-sage font-semibold py-2.5 rounded-xl transition duration-200 mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal/60 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-moss font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login