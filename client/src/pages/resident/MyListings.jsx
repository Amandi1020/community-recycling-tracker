import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import sortingImg from '../../assets/illustrations/sorting.jpeg'

const statusStyles = {
  available: 'bg-moss text-white',
  claimed:   'bg-clay text-white',
  collected: 'bg-charcoal/60 text-white'
}

const MyListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)

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

  const counts = {
    total:     listings.length,
    available: listings.filter(l => l.status === 'available').length,
    claimed:   listings.filter(l => l.status === 'claimed').length,
    collected: listings.filter(l => l.status === 'collected').length
  }

  const totalKg = listings
    .filter(l => l.status === 'collected')
    .reduce((sum, l) => sum + Number(l.weight_kg), 0)

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

        {/* Banner */}
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

        {/* Action + Stats row */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2">
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

        {/* Listings */}
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
                      src={`http://localhost:5000${listing.photo_url}`}
                      alt={listing.item_name}
                      className="w-full sm:w-28 h-28 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
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
                    </div>
                    <p className="text-charcoal/30 text-[10px] pt-1.5">Posted {new Date(listing.created_at).toLocaleDateString()}</p>
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