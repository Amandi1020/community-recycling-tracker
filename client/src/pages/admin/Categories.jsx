import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/admin/categories')
        setCategories(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleSave = async (cat) => {
    try {
      await axios.put(`/admin/categories/${cat.id}`, {
        points_per_kg: cat.points_per_kg,
        co2_per_kg: cat.co2_per_kg
      })
      setEditing(null)
      setMessage('Category updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (id, field, value) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="bg-forest rounded-2xl p-7 mb-5">
          <h1 className="font-display text-2xl font-medium text-sage mb-1">Manage categories</h1>
          <p className="text-sage/65 text-sm">Edit points per kg and CO₂ saved values for each recyclable category.</p>
        </div>

        {message && (
          <div className="bg-moss/20 border border-moss/30 text-forest text-sm px-4 py-3 rounded-xl mb-4">
            ✅ {message}
          </div>
        )}

        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-4 space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white/60 border border-moss/15 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-medium text-charcoal">{cat.name}</h2>
                {editing === cat.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(cat)} className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/90 transition">Save</button>
                    <button onClick={() => setEditing(null)} className="bg-charcoal/10 text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-charcoal/20 transition">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(cat.id)} className="bg-forest/10 text-forest text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-forest/20 transition">✏️ Edit</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-charcoal/50 uppercase tracking-wide mb-1 block">Points per kg</label>
                  {editing === cat.id ? (
                    <input type="number" value={cat.points_per_kg} onChange={(e) => handleChange(cat.id, 'points_per_kg', e.target.value)} className="w-full border border-moss/25 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moss/40" />
                  ) : (
                    <p className="font-display text-xl font-medium text-forest">{cat.points_per_kg}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-charcoal/50 uppercase tracking-wide mb-1 block">CO₂ per kg</label>
                  {editing === cat.id ? (
                    <input type="number" step="0.1" value={cat.co2_per_kg} onChange={(e) => handleChange(cat.id, 'co2_per_kg', e.target.value)} className="w-full border border-moss/25 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moss/40" />
                  ) : (
                    <p className="font-display text-xl font-medium text-clay">{cat.co2_per_kg}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Categories