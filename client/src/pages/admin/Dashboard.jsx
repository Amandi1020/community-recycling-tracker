import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

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
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-forest rounded-2xl p-8 mb-6">
          <h1 className="font-display text-3xl font-medium text-sage mb-1">Admin dashboard</h1>
          <p className="text-sage/65 text-sm">System-wide statistics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Residents</p>
            <p className="font-display text-3xl font-medium text-forest">{stats?.total_residents || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Collectors</p>
            <p className="font-display text-3xl font-medium text-moss">{stats?.total_collectors || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Listings</p>
            <p className="font-display text-3xl font-medium text-charcoal">{stats?.total_listings || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2">Kg recycled</p>
            <p className="font-display text-3xl font-medium text-clay">{stats?.total_kg || 0}</p>
          </div>
        </div>

        {/* District breakdown */}
        <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
          <h2 className="font-display text-lg font-medium text-charcoal mb-4">Recycling by district</h2>
          {stats?.districtStats?.length === 0 ? (
            <p className="text-charcoal/40 text-sm text-center py-6">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.districtStats?.map(d => (
                <div key={d.district} className="flex items-center justify-between border border-charcoal/8 rounded-xl p-4">
                  <p className="font-medium text-charcoal">{d.district}</p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forest">{d.total_kg} kg</p>
                    <p className="text-xs text-charcoal/40">{d.total_listings} listings</p>
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