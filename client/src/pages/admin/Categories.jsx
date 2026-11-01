import { useCallback, useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState({ text: '', type: 'success' })
  const [actionLoading, setActionLoading] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', points_per_kg: '', co2_per_kg: '' })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/admin/categories')
      setCategories(res.data)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to load categories', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories()
  }, [fetchCategories])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000)
  }

  const handleSave = async (cat) => {
    setActionLoading(`save-${cat.id}`)
    try {
      await axios.put(`/admin/categories/${cat.id}`, {
        points_per_kg: cat.points_per_kg,
        co2_per_kg: cat.co2_per_kg
      })
      setEditing(null)
      showMessage('Category updated successfully')
      await fetchCategories()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update category', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete the "${cat.name}" category?`)) return
    setActionLoading(`delete-${cat.id}`)
    try {
      await axios.delete(`/admin/categories/${cat.id}`)
      showMessage('Category deleted')
      await fetchCategories()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete category', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setActionLoading('create')
    try {
      await axios.post('/admin/categories', newCategory)
      setNewCategory({ name: '', points_per_kg: '', co2_per_kg: '' })
      showMessage('Category created')
      await fetchCategories()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create category', 'error')
    } finally {
      setActionLoading(null)
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

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${
            message.type === 'error'
              ? 'bg-clay/10 border-clay/20 text-clay'
              : 'bg-moss/20 border-moss/30 text-forest'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="bg-moss/20 rounded-2xl border border-moss/25 p-4 mb-4">
          <h2 className="font-display text-sm font-medium text-charcoal mb-3">Add category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="border border-moss/25 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
            <input
              type="number"
              required
              min="0"
              placeholder="Points/kg"
              value={newCategory.points_per_kg}
              onChange={(e) => setNewCategory({ ...newCategory, points_per_kg: e.target.value })}
              className="border border-moss/25 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
            <input
              type="number"
              required
              min="0"
              step="0.1"
              placeholder="CO₂/kg"
              value={newCategory.co2_per_kg}
              onChange={(e) => setNewCategory({ ...newCategory, co2_per_kg: e.target.value })}
              className="border border-moss/25 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
            <button
              type="submit"
              disabled={actionLoading === 'create'}
              className="bg-forest text-sage text-sm font-medium px-3 py-2 rounded-lg hover:bg-forest/90 transition disabled:opacity-50"
            >
              {actionLoading === 'create' ? 'Adding...' : 'Add category'}
            </button>
          </div>
        </form>

        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-4 space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white/60 border border-moss/15 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-medium text-charcoal">{cat.name}</h2>
                {editing === cat.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(cat)}
                      disabled={actionLoading === `save-${cat.id}`}
                      className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/90 transition disabled:opacity-50"
                    >
                      {actionLoading === `save-${cat.id}` ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(null)} className="bg-charcoal/10 text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-charcoal/20 transition">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(cat.id)} className="bg-forest/10 text-forest text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-forest/20 transition">Edit</button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={actionLoading === `delete-${cat.id}`}
                      className="bg-clay/15 text-clay text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-clay/25 transition disabled:opacity-50"
                    >
                      {actionLoading === `delete-${cat.id}` ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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
