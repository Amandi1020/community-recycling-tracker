import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const statusColors = {
  available: 'bg-green-100 text-green-700',
  claimed: 'bg-yellow-100 text-yellow-700',
  collected: 'bg-blue-100 text-blue-700'
}

const MyListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get('/resident/listings')
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
          
            href="/resident/post"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          <a>
            + Post New Item
          </a>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">♻️</p>
            <p className="text-gray-500">No listings yet. Post your first recyclable item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm p-6">

                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">{listing.item_name}</h2>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[listing.status]}`}>
                    {listing.status}
                  </span>
                </div>

                {listing.photo_url && (
                  <img
                    src={`http://localhost:5000${listing.photo_url}`}
                    alt={listing.item_name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <div className="space-y-1 text-sm text-gray-500">
                  <p>📦 Category: <span className="text-gray-700 font-medium">{listing.category_name}</span></p>
                  <p>⚖️ Weight: <span className="text-gray-700 font-medium">{listing.weight_kg} kg</span></p>
                  <p>📍 Address: <span className="text-gray-700 font-medium">{listing.address}</span></p>
                  <p>🕐 Available: <span className="text-gray-700 font-medium">{listing.available_time}</span></p>
                  <p>📅 Posted: <span className="text-gray-700 font-medium">{new Date(listing.created_at).toLocaleDateString()}</span></p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyListings