import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import axios from '../../utils/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const levelInfo = {
  'Seedling': { emoji: '🌱', color: 'bg-sage text-moss' },
  'Sprout': { emoji: '🌿', color: 'bg-sage text-moss' },
  'Guardian': { emoji: '🌳', color: 'bg-sage text-forest' },
  'Eco Hero': { emoji: '🏆', color: 'bg-clay/15 text-clay' }
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [badges, setBadges] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/resident/dashboard')
        setStats(res.data.stats)
        setBadges(res.data.badges)
        setChartData(res.data.chartData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const level = levelInfo[user?.level] || levelInfo['Seedling']

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero greeting */}
        <div className="bg-forest rounded-3xl p-8 mb-6 relative overflow-hidden">
          <svg className="absolute -right-16 -top-16 w-64 h-64 opacity-50" viewBox="0 0 200 200">
            <path fill="#3D7A5C" d="M45.3,-58.5C58.6,-49.5,69.2,-35.4,73.8,-19.5C78.4,-3.7,77,13.9,69.5,28.4C62,42.9,48.4,54.2,33.2,61.6C17.9,69,1,72.5,-16.5,71.2C-34,69.9,-52.1,63.8,-63.6,51.2C-75.1,38.6,-80,19.3,-78.7,1C-77.4,-17.4,-69.9,-34.8,-57.6,-44.4C-45.3,-54.1,-28.2,-56,-11.7,-58.6C4.9,-61.2,32,-67.5,45.3,-58.5Z" transform="translate(100 100)" />
          </svg>
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-sage/60 text-sm mb-1">Welcome back</p>
              <h1 className="font-display text-3xl font-medium text-sage">{user?.name}</h1>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${level.color}`}>
              <span className="text-xl">{level.emoji}</span>
              <span className="font-medium text-sm">{user?.level || 'Seedling'}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
            <p className="text-charcoal/50 text-xs font-medium uppercase tracking-wide mb-2">Total points</p>
            <p className="font-display text-3xl font-medium text-forest">{stats?.total_points || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
            <p className="text-charcoal/50 text-xs font-medium uppercase tracking-wide mb-2">Kg recycled</p>
            <p className="font-display text-3xl font-medium text-forest">{stats?.total_kg || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
            <p className="text-charcoal/50 text-xs font-medium uppercase tracking-wide mb-2">CO₂ saved</p>
            <p className="font-display text-3xl font-medium text-clay">{stats?.co2_saved || 0} <span className="text-base">kg</span></p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-charcoal/8 p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-charcoal mb-5">Monthly recycling</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#1C1F1D99' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#1C1F1D99' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#E8F0E5' }} contentStyle={{ borderRadius: 12, border: '1px solid #1C1F1D15' }} />
                <Bar dataKey="kg" fill="#3D7A5C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🌱</p>
              <p className="text-charcoal/40 text-sm">No recycling data yet — post your first item to begin.</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
          <h2 className="font-display text-lg font-medium text-charcoal mb-5">Your badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="text-center p-4 bg-sage/40 rounded-xl">
                  <p className="text-3xl mb-2">{badge.icon}</p>
                  <p className="text-sm font-medium text-charcoal">{badge.name}</p>
                  <p className="text-xs text-charcoal/50 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🏅</p>
              <p className="text-charcoal/40 text-sm">No badges yet — start recycling to earn your first one.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard