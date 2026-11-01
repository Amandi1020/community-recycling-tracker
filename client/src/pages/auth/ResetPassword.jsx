import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../../utils/axios'
import heroLogin from '../../assets/illustrations/hero-login.jpeg'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('This reset link is missing a token.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await axios.post('/auth/reset-password', { token, password: formData.password })
      navigate('/login?msg=reset')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={heroLogin} alt="Recycling illustration" className="w-full h-full object-cover absolute inset-0" />
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <span className="text-3xl">♻️</span>
          <span className="font-display text-2xl font-semibold text-white drop-shadow-md">EcoTrack</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-medium text-charcoal mb-2">Choose a new password</h2>
          <p className="text-charcoal/60 text-sm mb-6">Your reset link is valid for one hour.</p>

          {error && (
            <div className="bg-clay/10 text-clay border border-clay/20 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">New password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                maxLength={72}
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                maxLength={72}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="Repeat your new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest hover:bg-forest/90 text-sage font-semibold py-2.5 rounded-xl transition duration-200"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal/60 mt-6">
            <Link to="/login" className="text-moss font-medium hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
