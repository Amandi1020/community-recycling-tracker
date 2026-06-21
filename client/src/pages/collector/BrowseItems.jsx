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
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

       <div className="bg-forest rounded-2xl mb-6 overflow-hidden grid grid-cols-1 sm:grid-cols-3">
          <div className="sm:col-span-2 p-8 flex flex-col justify-center">
            <h1 className="font-display text-3xl font-medium text-sage mb-1">Browse available items</h1>
            <p className="text-sage/65 text-sm">Items available for pickup in your district</p>
          </div>
          <img
            src={collectorBrowseImg}
            alt="Truck collecting recyclables"
            className="w-full h-full object-cover min-h-[140px]"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition
                ${filter === cat
                  ? 'bg-forest text-sage'
                  : 'bg-white text-charcoal/60 border border-charcoal/10 hover:border-moss/40'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-charcoal/8 p-16 text-center">
            <p className="text-4xl mb-4">♻️</p>
            <p className="text-charcoal/50 text-sm">No items available in your district right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">

                {listing.photo_url && (
                  <img
                    src={`http://localhost:5000${listing.photo_url}`}
                    alt={listing.item_name}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-display text-lg font-medium text-charcoal">{listing.item_name}</h2>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-sage text-moss">
                      {listing.category_name}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-charcoal/55 mb-4">
                    <p>Weight — <span className="text-charcoal font-medium">{listing.weight_kg} kg</span></p>
                    <p>Address — <span className="text-charcoal font-medium">{listing.address}</span></p>
                    <p>Available — <span className="text-charcoal font-medium">{listing.available_time}</span></p>
                    <p>Posted by — <span className="text-charcoal font-medium">{listing.resident_name}</span></p>
                  </div>

                  <button
                    onClick={() => handleClaim(listing.id)}
                    disabled={claiming === listing.id}
                    className="w-full bg-forest hover:bg-forest/90 text-sage text-sm font-semibold py-2.5 rounded-xl transition"
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
  )
}

export default BrowseItems