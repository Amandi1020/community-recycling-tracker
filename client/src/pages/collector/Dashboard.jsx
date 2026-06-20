import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/collector/dashboard')
        setStats(res.data)
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
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="bg-forest rounded-2xl p-8 mb-6">
          <h1 className="font-display text-3xl font-medium text-sage mb-1">Collector dashboard</h1>
          <p className="text-sage/65 text-sm">Your collection statistics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Total collections</p>
            <p className="font-display text-3xl font-medium text-forest">{stats?.total_collections || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Total kg collected</p>
            <p className="font-display text-3xl font-medium text-forest">{stats?.total_kg || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Pending pickups</p>
            <p className="font-display text-3xl font-medium text-clay">{stats?.pending || 0}</p>
          </div>
        </div>

        {/* Pending pickups */}
        <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
          <h2 className="font-display text-lg font-medium text-charcoal mb-4">Pending pickups</h2>
          {stats?.pendingList?.length === 0 ? (
            <p className="text-charcoal/40 text-sm text-center py-6">No pending pickups right now.</p>
          ) : (
            <div className="space-y-3">
              {stats?.pendingList?.map(item => (
                <div key={item.id} className="flex items-center justify-between border border-charcoal/8 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-charcoal">{item.item_name}</p>
                    <p className="text-sm text-charcoal/50">{item.address} — {item.weight_kg} kg</p>
                    <p className="text-sm text-charcoal/50">{item.available_time}</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-clay/15 text-clay">
                    claimed
                  </span>
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