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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Collector Dashboard 🚛</h1>
          <p className="text-gray-500 mt-1">Your collection statistics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Collections</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_collections || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total kg Collected</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_kg || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Pending Pickups</p>
            <p className="text-3xl font-bold text-yellow-500">{stats?.pending || 0}</p>
          </div>
        </div>

        {/* Pending pickups */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Pickups</h2>
          {stats?.pendingList?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No pending pickups right now.</p>
          ) : (
            <div className="space-y-3">
              {stats?.pendingList?.map(item => (
                <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-gray-800">{item.item_name}</p>
                    <p className="text-sm text-gray-500">📍 {item.address} — ⚖️ {item.weight_kg} kg</p>
                    <p className="text-sm text-gray-500">🕐 {item.available_time}</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
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