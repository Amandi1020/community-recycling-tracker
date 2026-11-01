import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../utils/axios'
import heroLogin from '../../assets/illustrations/hero-login.jpeg'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setResetUrl('')
    try {
      const res = await axios.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
      if (res.data.devResetUrl) {
        setResetUrl(res.data.devResetUrl)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create a reset link')
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
          <h2 className="font-display text-3xl font-medium text-charcoal mb-2">Reset your password</h2>
          <p className="text-charcoal/60 text-sm mb-6">Enter your account email to create a reset link.</p>

          {error && (
            <div className="bg-clay/10 text-clay border border-clay/20 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}
          {message && (
            <div className="bg-moss/20 text-forest border border-moss/30 px-4 py-3 rounded-xl mb-4 text-sm">
              {message}
              {resetUrl && (
                <a href={resetUrl} className="block mt-2 font-medium underline break-all">
                  Open development reset link
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest hover:bg-forest/90 text-sage font-semibold py-2.5 rounded-xl transition duration-200"
            >
              {loading ? 'Creating link...' : 'Send reset link'}
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

export default ForgotPassword
