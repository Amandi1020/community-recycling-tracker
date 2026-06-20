import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../../utils/axios'
import { useAuth } from '../../context/AuthContext'
import heroLogin from '../../assets/illustrations/hero-login.jpeg'

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

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <span className="font-display text-2xl font-semibold text-sage">EcoTrack</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <img
            src={heroLogin}
            alt="Person recycling illustration"
            className="w-72 h-72 object-contain rounded-2xl mb-6"
          />
          <h1 className="font-display text-3xl font-medium text-sage leading-tight mb-3 text-center">
            Recycling, reimagined for your community.
          </h1>
          <p className="text-sage/70 text-sm max-w-sm text-center">
            Post what you no longer need. Earn points for what you give away.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-sage/80 text-sm justify-center">
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
            <p>Levels</p>
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