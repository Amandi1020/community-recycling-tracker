import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axios, { mediaUrl } from '../../utils/axios'
import sortingImg from '../../assets/illustrations/sorting.jpeg'

const statusStyles = {
  available: 'bg-moss text-white',
  claimed:   'bg-clay text-white',
  collected: 'bg-charcoal/60 text-white',
  cancelled: 'bg-charcoal/20 text-charcoal/60'
}

const MyListings = () => {
  const [listings, setListings] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState({ text: '', type: 'success' })

  const fetchListings = useCallback(async () => {
    try {
      const res = await axios.get('/resident/listings')
      setListings(res.data.data)
      setSummary(res.data.summary)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to load listings', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings()
  }, [fetchListings])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000)
  }

  const handleCancel = async (listingId) => {
    if (!window.confirm('Cancel this listing? It will no longer be visible to collectors.')) return
    setActionLoading(`cancel-${listingId}`)
    try {
      await axios.delete(`/resident/listings/${listingId}`)
      showMessage('Listing cancelled')
      await fetchListings()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to cancel listing', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRate = async (claimId, rating) => {
    setActionLoading(`rate-${claimId}`)
    try {
      await axios.post(`/resident/claims/${claimId}/rating`, { rating })
      showMessage('Thanks for rating your collector')
      await fetchListings()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to submit rating', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const counts = {
    total: summary?.total ?? listings.length,
    available: summary?.available ?? listings.filter(l => l.status === 'available').length,
    claimed: summary?.claimed ?? listings.filter(l => l.status === 'claimed').length,
    collected: summary?.collected ?? listings.filter(l => l.status === 'collected').length
  }

  const totalKg = Number(summary?.kg_collected ?? 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <h1 className="font-display text-2xl font-medium text-sage mb-1">My listings</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Track every item you've posted — from available, to claimed, to safely collected.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={sortingImg}
              alt="Sorting recyclables"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${
            message.type === 'error'
              ? 'bg-clay/10 border-clay/20 text-clay'
              : 'bg-moss/20 border-moss/30 text-forest'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="bg-forest rounded-xl px-4 py-2 text-center min-w-[64px]">
              <p className="font-display text-lg font-medium text-sage">{counts.total}</p>
              <p className="text-[10px] text-sage/55 uppercase tracking-wide">Total</p>
            </div>
            <div className="bg-moss rounded-xl px-4 py-2 text-center min-w-[64px]">
              <p className="font-display text-lg font-medium text-white">{counts.available}</p>
              <p className="text-[10px] text-white/65 uppercase tracking-wide">Available</p>
            </div>
            <div className="bg-clay rounded-xl px-4 py-2 text-center min-w-[64px]">
              <p className="font-display text-lg font-medium text-white">{counts.claimed}</p>
              <p className="text-[10px] text-white/65 uppercase tracking-wide">Claimed</p>
            </div>
            <div className="bg-charcoal/70 rounded-xl px-4 py-2 text-center min-w-[64px]">
              <p className="font-display text-lg font-medium text-sage">{totalKg.toFixed(1)}</p>
              <p className="text-[10px] text-sage/55 uppercase tracking-wide">Kg done</p>
            </div>
          </div>
          <Link
            to="/resident/post"
            className="bg-forest hover:bg-forest/90 text-sage text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            + Post new
          </Link>
        </div>

        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          {listings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">♻️</p>
              <p className="text-charcoal/50 text-sm">No listings yet — post your first recyclable item.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white/60 rounded-xl overflow-hidden sm:flex border border-moss/15">
                  {listing.photo_url && (
                    <img
                      src={mediaUrl(listing.photo_url)}
                      alt={listing.item_name}
                      className="w-full sm:w-28 h-28 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <h2 className="font-display text-sm font-medium text-charcoal">{listing.item_name}</h2>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusStyles[listing.status]}`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-charcoal/55">
                      <p>Category — <span className="text-charcoal font-medium">{listing.category_name}</span></p>
                      <p>Weight — <span className="text-charcoal font-medium">{listing.weight_kg} kg</span></p>
                      <p>Address — <span className="text-charcoal font-medium">{listing.address}</span></p>
                      <p>Available — <span className="text-charcoal font-medium">{listing.available_time}</span></p>
                      {listing.collector_name && (
                        <p>Collector — <span className="text-charcoal font-medium">{listing.collector_name}</span></p>
                      )}
                    </div>
                    <p className="text-charcoal/30 text-[10px] pt-1.5">Posted {new Date(listing.created_at).toLocaleDateString()}</p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {listing.status === 'available' && (
                        <button
                          onClick={() => handleCancel(listing.id)}
                          disabled={actionLoading === `cancel-${listing.id}`}
                          className="bg-clay/15 text-clay text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-clay/25 transition disabled:opacity-50"
                        >
                          {actionLoading === `cancel-${listing.id}` ? 'Cancelling...' : 'Cancel listing'}
                        </button>
                      )}

                      {listing.status === 'collected' && listing.claim_id && !listing.rating && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-charcoal/50">Rate collector:</span>
                          {[1, 2, 3, 4, 5].map(value => (
                            <button
                              key={value}
                              onClick={() => handleRate(listing.claim_id, value)}
                              disabled={actionLoading === `rate-${listing.claim_id}`}
                              className="text-sm text-clay hover:scale-110 transition disabled:opacity-50"
                              aria-label={`Rate ${value} out of 5`}
                            >
                              {value <= (listing.rating || 0) ? '★' : '☆'}
                            </button>
                          ))}
                        </div>
                      )}

                      {listing.rating && (
                        <span className="text-[11px] text-charcoal/55">
                          Rated {listing.rating}/5 for {listing.collector_name}
                        </span>
                      )}
                    </div>
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

export default MyListings
