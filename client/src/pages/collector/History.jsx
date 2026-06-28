import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import historyImg from '../../assets/illustrations/history.jpeg'

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

  const totalKg = history
    .filter(i => i.status === 'collected')
    .reduce((sum, i) => sum + Number(i.weight_kg), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading history...</p>
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
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Collection history</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              All your claimed and completed pickups — your recycling contribution over time.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={historyImg}
              alt="Collection history illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{history.length}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Total</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">
              {history.filter(i => i.status === 'collected').length}
            </p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Completed</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{totalKg.toFixed(1)}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Kg collected</p>
          </div>
        </div>

        {/* History list */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">🚛</p>
              <p className="text-charcoal/50 text-sm">No collections yet — browse items to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.claim_id} className="bg-white/60 rounded-xl border border-moss/15 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="font-display text-sm font-medium text-charcoal">{item.item_name}</h2>
                      <p className="text-xs text-charcoal/50">Resident: {item.resident_name}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                      ${item.status === 'collected' ? 'bg-moss text-white' : 'bg-clay text-white'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-charcoal/55 mb-2">
                    <p>Category — <span className="text-charcoal font-medium">{item.category_name}</span></p>
                    <p>Weight — <span className="text-charcoal font-medium">{item.weight_kg} kg</span></p>
                    <p>Address — <span className="text-charcoal font-medium">{item.address}</span></p>
                    <p>Available — <span className="text-charcoal font-medium">{item.available_time}</span></p>
                  </div>
                  <p className="text-charcoal/30 text-[10px]">
                    Claimed {new Date(item.claimed_at).toLocaleDateString()}
                    {item.collected_at && ` · Collected ${new Date(item.collected_at).toLocaleDateString()}`}
                  </p>
                  {item.status === 'claimed' && (
                    <button
                      onClick={() => handleMarkCollected(item.claim_id)}
                      className="mt-3 bg-forest hover:bg-forest/90 text-sage text-xs font-semibold px-4 py-1.5 rounded-lg transition"
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
    </div>
  )
}

export default History