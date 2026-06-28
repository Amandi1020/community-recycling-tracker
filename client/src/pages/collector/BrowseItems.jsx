import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import collectorBrowseImg from '../../assets/illustrations/collector-browse.jpeg'

const BrowseItems = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [claiming, setClaiming] = useState(null)

  useEffect(() => {
    fetchListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchListings = async () => {
    try {
      const res = await axios.get('/collector/browse')
      setListings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (listingId) => {
    setClaiming(listingId)
    try {
      await axios.post(`/collector/claim/${listingId}`)
      fetchListings()
    } catch (err) {
      console.error(err)
    } finally {
      setClaiming(null)
    }
  }

  const filtered = filter === 'all'
    ? listings
    : listings.filter(l => l.category_name.toLowerCase() === filter)

  const categories = ['all', ...new Set(listings.map(l => l.category_name.toLowerCase()))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading items...</p>
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
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Browse available items</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Claim recyclables posted by residents in your district and schedule a pickup.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={collectorBrowseImg}
              alt="Collector browsing items"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition
                ${filter === cat
                  ? 'bg-forest text-sage'
                  : 'bg-white/60 text-charcoal/60 border border-moss/20 hover:border-moss/40'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">♻️</p>
              <p className="text-charcoal/50 text-sm">No items available in your district right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(listing => (
                <div key={listing.id} className="bg-white/60 rounded-xl overflow-hidden sm:flex border border-moss/15">
                  {listing.photo_url && (
                    <img
                      src={`http://localhost:5000${listing.photo_url}`}
                      alt={listing.item_name}
                      className="w-full sm:w-28 h-28 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="font-display text-sm font-medium text-charcoal">{listing.item_name}</h2>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-moss/20 text-moss">
                        {listing.category_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-charcoal/55 mb-3">
                      <p>Weight — <span className="text-charcoal font-medium">{listing.weight_kg} kg</span></p>
                      <p>Posted by — <span className="text-charcoal font-medium">{listing.resident_name}</span></p>
                      <p>Address — <span className="text-charcoal font-medium">{listing.address}</span></p>
                      <p>Available — <span className="text-charcoal font-medium">{listing.available_time}</span></p>
                    </div>
                    <button
                      onClick={() => handleClaim(listing.id)}
                      disabled={claiming === listing.id}
                      className="bg-forest hover:bg-forest/90 text-sage text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                    >
                      {claiming === listing.id ? 'Claiming...' : 'Claim pickup'}
                    </button>
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

export default BrowseItems