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
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard ⚙️</h1>
          <p className="text-gray-500 mt-1">System-wide statistics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Residents</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_residents || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Collectors</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.total_collectors || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Listings</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.total_listings || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total kg Recycled</p>
            <p className="text-3xl font-bold text-orange-500">{stats?.total_kg || 0}</p>
          </div>
        </div>

        {/* District breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recycling by District</h2>
          {stats?.districtStats?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.districtStats?.map(d => (
                <div key={d.district} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                  <p className="font-medium text-gray-700">{d.district}</p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{d.total_kg} kg</p>
                    <p className="text-xs text-gray-400">{d.total_listings} listings</p>
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