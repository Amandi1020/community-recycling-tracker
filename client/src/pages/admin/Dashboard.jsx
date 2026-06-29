import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import adminDashboardImg from '../../assets/illustrations/admin-dashboard.jpeg'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/dashboard')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Admin dashboard</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Monitor system-wide recycling activity, user growth and district performance.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={adminDashboardImg}
              alt="Admin dashboard illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_residents || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Residents</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_collectors || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Collectors</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_listings || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Listings</p>
          </div>
          <div className="bg-charcoal/70 rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_kg || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Kg recycled</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5 mb-5">
          <h2 className="font-display text-base font-medium text-charcoal mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/users" className="bg-forest text-sage text-center text-sm font-medium py-3 rounded-xl hover:bg-forest/90 transition">
              👥 Manage users
            </a>
            <a href="/admin/collectors" className="bg-moss text-white text-center text-sm font-medium py-3 rounded-xl hover:bg-moss/90 transition">
              🚛 Manage collectors
            </a>
          </div>
        </div>

        {/* District breakdown */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          <h2 className="font-display text-base font-medium text-charcoal mb-3">Recycling by district</h2>
          {!stats?.districtStats?.length ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📊</p>
              <p className="text-charcoal/40 text-sm">No data yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.districtStats.map(d => (
                <div key={d.district} className="bg-white/60 border border-moss/15 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="font-medium text-charcoal text-sm">{d.district}</p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forest">{d.total_kg} kg</p>
                    <p className="text-[10px] text-charcoal/40">{d.total_listings} listings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard