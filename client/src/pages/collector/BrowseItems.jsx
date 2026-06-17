import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const BrowseItems = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [claiming, setClaiming] = useState(null)

  useEffect(() => {
    fetchListings()
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
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Browse Available Items ♻️</h1>
          <p className="text-gray-500 mt-1">Items available for pickup in your district</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition
                ${filter === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">♻️</p>
            <p className="text-gray-500">No items available in your district right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm p-6">

                {listing.photo_url && (
                  <img
                    src={`http://localhost:5000${listing.photo_url}`}
                    alt={listing.item_name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">{listing.item_name}</h2>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                    {listing.category_name}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p>⚖️ Weight: <span className="text-gray-700 font-medium">{listing.weight_kg} kg</span></p>
                  <p>📍 Address: <span className="text-gray-700 font-medium">{listing.address}</span></p>
                  <p>🕐 Available: <span className="text-gray-700 font-medium">{listing.available_time}</span></p>
                  <p>👤 Posted by: <span className="text-gray-700 font-medium">{listing.resident_name}</span></p>
                </div>

                <button
                  onClick={() => handleClaim(listing.id)}
                  disabled={claiming === listing.id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  {claiming === listing.id ? 'Claiming...' : 'Claim Pickup 🚛'}
                </button>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default BrowseItems