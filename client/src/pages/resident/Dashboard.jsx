import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import axios from '../../utils/axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import seedlingIcon from '../../assets/icons/seeding.png'
import treeIcon from '../../assets/icons/tree.png'
import trophyIcon from '../../assets/icons/trophy.png'
import residentDashboardImg from '../../assets/illustrations/resident-dashboard.jpeg'

const levelInfo = {
  'Seedling': { icon: seedlingIcon, color: 'bg-sage text-moss' },
  'Sprout':   { icon: seedlingIcon, color: 'bg-sage text-moss' },
  'Guardian': { icon: treeIcon,     color: 'bg-sage text-forest' },
  'Eco Hero': { icon: trophyIcon,   color: 'bg-clay/15 text-clay' }
}

const CHART_COLORS = ['#3D7A5C', '#D97B4A', '#6B8E5A', '#A66B3F', '#88A77A', '#C99060']

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats]         = useState(null)
  const [badges, setBadges]       = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading]     = useState(true)

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
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero banner — same style as Post Item / My Listings */}
        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <p className="text-sage/55 text-xs uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="font-display text-2xl font-medium text-sage mb-3">{user?.name}</h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-sm ${level.color}`}>
              <img src={level.icon} alt={user?.level} className="w-4 h-4 object-contain" />
              <span className="font-medium">{user?.level || 'Seedling'}</span>
            </div>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={residentDashboardImg}
              alt="Resident sorting recyclables"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Compact stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_points || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Points</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_kg || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Kg recycled</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.co2_saved || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">CO₂ saved kg</p>
          </div>
        </div>

        {/* Chart + Badges side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

          {/* Donut chart */}
          <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
            <h2 className="font-display text-base font-medium text-charcoal mb-3">Monthly breakdown</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="kg"
                    nameKey="month"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #6B8E5A30', fontSize: 12 }}
                    formatter={(value) => [`${value} kg`, '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(value) => <span style={{ color: '#2B2E28', fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">🌱</p>
                <p className="text-charcoal/40 text-xs">Post your first item to see data here.</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
            <h2 className="font-display text-base font-medium text-charcoal mb-3">Your badges</h2>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className="text-center p-3 bg-moss/15 rounded-xl">
                    <p className="text-2xl mb-1">{badge.icon}</p>
                    <p className="text-xs font-medium text-charcoal">{badge.name}</p>
                    <p className="text-[10px] text-charcoal/45 mt-0.5">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">🏅</p>
                <p className="text-charcoal/40 text-xs">Start recycling to earn badges!</p>
              </div>
            )}
          </div>

        </div>

        {/* Quick actions */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          <h2 className="font-display text-base font-medium text-charcoal mb-3">Quick actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <a href="/resident/post" className="bg-forest text-sage text-center text-sm font-medium py-3 rounded-xl hover:bg-forest/90 transition">
              ♻️ Post item
            </a>
            <a href="/resident/listings" className="bg-moss text-white text-center text-sm font-medium py-3 rounded-xl hover:bg-moss/90 transition">
              📋 My listings
            </a>
            <a href="/resident/leaderboard" className="bg-clay text-white text-center text-sm font-medium py-3 rounded-xl hover:bg-clay/90 transition">
              🏆 Leaderboard
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard