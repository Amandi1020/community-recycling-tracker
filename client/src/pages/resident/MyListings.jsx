import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const statusStyles = {
  available: 'bg-sage text-moss',
  claimed: 'bg-clay/15 text-clay',
  collected: 'bg-charcoal/8 text-charcoal/60'
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
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-forest rounded-2xl p-7 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium text-sage mb-1">My listings</h1>
            <p className="text-sage/65 text-sm">Everything you've posted so far</p>
          </div>
          <Link
            to="/resident/post"
            className="bg-sage hover:bg-sage/90 text-forest text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            + Post new item
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-charcoal/8 p-16 text-center">
            <p className="text-4xl mb-4">♻️</p>
            <p className="text-charcoal/50 text-sm">No listings yet — post your first recyclable item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(listing => (
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
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusStyles[listing.status]}`}>
                      {listing.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-charcoal/55">
                    <p>Category — <span className="text-charcoal font-medium">{listing.category_name}</span></p>
                    <p>Weight — <span className="text-charcoal font-medium">{listing.weight_kg} kg</span></p>
                    <p>Address — <span className="text-charcoal font-medium">{listing.address}</span></p>
                    <p>Available — <span className="text-charcoal font-medium">{listing.available_time}</span></p>
                    <p className="text-charcoal/35 text-xs pt-1">Posted {new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
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