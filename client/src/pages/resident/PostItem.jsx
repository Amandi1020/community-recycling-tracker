import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const PostItem = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    weight_kg: '',
    address: '',
    available_time: ''
  })
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/resident/categories')
        setCategories(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key]))
      if (photo) data.append('photo', photo)

      await axios.post('/resident/post', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate('/resident/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-6">
          <h1 className="font-display text-3xl font-medium text-charcoal mb-1">Post a recyclable item</h1>
          <p className="text-charcoal/55 text-sm">Tell your district what you're giving away</p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/8 p-8">

          {error && (
            <div className="bg-clay/10 text-clay border border-clay/20 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Item name</label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                required
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="e.g. Plastic bottles, Old laptop"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} — {cat.points_per_kg} pts/kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                  placeholder="2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Pickup address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="Enter your pickup address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Available time</label>
              <input
                type="text"
                name="available_time"
                value={formData.available_time}
                onChange={handleChange}
                required
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition"
                placeholder="e.g. Weekdays 9am – 5pm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 text-charcoal/70 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-sage file:text-moss file:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest hover:bg-forest/90 text-sage font-semibold py-2.5 rounded-xl transition duration-200 mt-2"
            >
              {loading ? 'Posting...' : 'Post item'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default PostItem