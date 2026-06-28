import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import collectorDashboardImg from '../../assets/illustrations/collector-dashboard.jpeg'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/collector/dashboard')
        setStats(res.data.stats)
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
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Collector dashboard</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Track your pickups, monitor your collection stats and manage pending items.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={collectorDashboardImg}
              alt="Collector dashboard illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_collections || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Collections</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_kg || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Kg collected</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.pending || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Pending</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5 mb-5">
          <h2 className="font-display text-base font-medium text-charcoal mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/collector/browse" className="bg-forest text-sage text-center text-sm font-medium py-3 rounded-xl hover:bg-forest/90 transition">
              ♻️ Browse items
            </a>
            <a href="/collector/history" className="bg-moss text-white text-center text-sm font-medium py-3 rounded-xl hover:bg-moss/90 transition">
              📋 My history
            </a>
          </div>
        </div>

        {/* Pending pickups */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          <h2 className="font-display text-base font-medium text-charcoal mb-3">Pending pickups</h2>
          {!stats?.pendingList?.length ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🚛</p>
              <p className="text-charcoal/40 text-sm">No pending pickups right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.pendingList.map(item => (
                <div key={item.id} className="bg-white/60 border border-moss/15 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal text-sm">{item.item_name}</p>
                    <p className="text-xs text-charcoal/50">{item.address} · {item.weight_kg} kg</p>
                    <p className="text-xs text-charcoal/50">{item.available_time}</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-clay text-white">claimed</span>
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