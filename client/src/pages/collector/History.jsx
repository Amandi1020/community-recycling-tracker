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
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-forest rounded-2xl p-8 mb-6">
          <h1 className="font-display text-3xl font-medium text-sage mb-1">Collection history</h1>
          <p className="text-sage/65 text-sm">All your claimed and collected items</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-charcoal/8 p-16 text-center">
            <p className="text-4xl mb-4">🚛</p>
            <p className="text-charcoal/50 text-sm">No collections yet — browse items to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.claim_id} className="bg-white rounded-2xl border border-charcoal/8 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-display text-lg font-medium text-charcoal">{item.item_name}</h2>
                    <p className="text-sm text-charcoal/50">Resident: {item.resident_name}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full
                    ${item.status === 'collected'
                      ? 'bg-moss/15 text-moss'
                      : 'bg-clay/15 text-clay'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-charcoal/55 mb-4">
                  <p>Category — <span className="text-charcoal font-medium">{item.category_name}</span></p>
                  <p>Weight — <span className="text-charcoal font-medium">{item.weight_kg} kg</span></p>
                  <p>Address — <span className="text-charcoal font-medium">{item.address}</span></p>
                  <p>Available — <span className="text-charcoal font-medium">{item.available_time}</span></p>
                  <p className="text-charcoal/35 text-xs pt-1">
                    Claimed {new Date(item.claimed_at).toLocaleDateString()}
                    {item.collected_at && ` · Collected ${new Date(item.collected_at).toLocaleDateString()}`}
                  </p>
                </div>

                {item.status === 'claimed' && (
                  <button
                    onClick={() => handleMarkCollected(item.claim_id)}
                    className="w-full bg-forest hover:bg-forest/90 text-sage text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    Mark as collected
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