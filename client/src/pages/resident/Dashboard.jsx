import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import axios from '../../utils/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const levelColors = {
  'Seedling': 'bg-green-100 text-green-700',
  'Sprout': 'bg-lime-100 text-lime-700',
  'Guardian': 'bg-emerald-100 text-emerald-700',
  'Eco Hero': 'bg-teal-100 text-teal-700'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's your recycling impact so far.</p>
        </div>

        {/* Level & Points */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Level</p>
            <span className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-semibold ${levelColors[user?.level] || 'bg-green-100 text-green-700'}`}>
              {user?.level || 'Seedling'}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_points || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total kg Recycled</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_kg || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">CO₂ Saved</p>
            <p className="text-3xl font-bold text-green-600">{stats?.co2_saved || 0} kg</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Recycling (kg)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kg" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No recycling data yet. Post your first item!</p>
          )}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl mb-2">{badge.icon}</p>
                  <p className="text-sm font-semibold text-gray-700">{badge.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No badges yet. Start recycling to earn some! 🌱</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard