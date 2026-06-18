import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/collector/history')
        setHistory(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleMarkCollected = async (claimId) => {
    try {
      await axios.put(`/collector/collect/${claimId}`)
      setHistory(history.map(item =>
        item.claim_id === claimId
          ? { ...item, status: 'collected', collected_at: new Date() }
          : item
      ))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Collection History 📋</h1>
          <p className="text-gray-500 mt-1">All your claimed and collected items</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">🚛</p>
            <p className="text-gray-500">No collections yet. Browse items to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.claim_id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{item.item_name}</h2>
                    <p className="text-sm text-gray-500">👤 Resident: {item.resident_name}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full
                    ${item.status === 'collected'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p>📦 Category: <span className="text-gray-700 font-medium">{item.category_name}</span></p>
                  <p>⚖️ Weight: <span className="text-gray-700 font-medium">{item.weight_kg} kg</span></p>
                  <p>📍 Address: <span className="text-gray-700 font-medium">{item.address}</span></p>
                  <p>🕐 Available: <span className="text-gray-700 font-medium">{item.available_time}</span></p>
                  <p>📅 Claimed: <span className="text-gray-700 font-medium">{new Date(item.claimed_at).toLocaleDateString()}</span></p>
                  {item.collected_at && (
                    <p>✅ Collected: <span className="text-gray-700 font-medium">{new Date(item.collected_at).toLocaleDateString()}</span></p>
                  )}
                </div>

                {item.status === 'claimed' && (
                  <button
                    onClick={() => handleMarkCollected(item.claim_id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
                  >
                    Mark as Collected ✅
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default History