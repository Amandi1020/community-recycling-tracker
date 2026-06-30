import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const Collectors = () => {
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCollectors()
  }, [])

  const fetchCollectors = async () => {
    try {
      const res = await axios.get('/admin/users')
      setCollectors(res.data.filter(u => u.role === 'collector'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, status) => {
    setActionLoading(userId)
    try {
      await axios.put(`/admin/users/${userId}/status`, { status })
      setCollectors(collectors.map(c => c.id === userId ? { ...c, status } : c))
      setMessage(`Collector ${status === 'active' ? 'approved' : status === 'inactive' ? 'deactivated' : 'updated'} successfully`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const pending = collectors.filter(c => c.status === 'pending')
  const active = collectors.filter(c => c.status === 'active')
  const inactive = collectors.filter(c => c.status === 'inactive')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading collectors...</p>
        </div>
      </div>
    )
  }

  const CollectorCard = ({ collector }) => (
    <div className="bg-white/60 border border-moss/15 rounded-xl p-4 flex items-center gap-4 flex-wrap">
      <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-sage font-display font-semibold flex-shrink-0">
        {collector.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal text-sm">{collector.name}</p>
        <p className="text-xs text-charcoal/50">{collector.email} · {collector.district}</p>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize mt-1 inline-block
          ${collector.status === 'active' ? 'bg-moss/15 text-moss' :
            collector.status === 'pending' ? 'bg-clay/20 text-clay' :
            'bg-charcoal/10 text-charcoal/50'}`}>
          {collector.status}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {collector.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusChange(collector.id, 'active')}
              disabled={actionLoading === collector.id}
              className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/90 transition"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleStatusChange(collector.id, 'inactive')}
              disabled={actionLoading === collector.id}
              className="bg-clay/20 text-clay text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-clay/30 transition"
            >
              ❌ Reject
            </button>
          </>
        )}
        {collector.status === 'active' && (
          <button
            onClick={() => handleStatusChange(collector.id, 'inactive')}
            disabled={actionLoading === collector.id}
            className="bg-charcoal/20 text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-charcoal/30 transition"
          >
            🔒 Deactivate
          </button>
        )}
        {collector.status === 'inactive' && (
          <button
            onClick={() => handleStatusChange(collector.id, 'active')}
            disabled={actionLoading === collector.id}
            className="bg-moss/20 text-moss text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/30 transition"
          >
            🔓 Reactivate
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="bg-forest rounded-2xl p-7 mb-5">
          <h1 className="font-display text-2xl font-medium text-sage mb-1">Manage collectors</h1>
          <p className="text-sage/65 text-sm">
            Approve new collector registrations, reactivate or deactivate collector accounts.
          </p>
        </div>

        {message && (
          <div className="bg-moss/20 border border-moss/30 text-forest text-sm px-4 py-3 rounded-xl mb-4">
            ✅ {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{pending.length}</p>
            <p className="text-[11px] text-white/70 uppercase tracking-wide mt-0.5">Pending</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{active.length}</p>
            <p className="text-[11px] text-white/70 uppercase tracking-wide mt-0.5">Active</p>
          </div>
          <div className="bg-charcoal/70 rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{inactive.length}</p>
            <p className="text-[11px] text-sage/60 uppercase tracking-wide mt-0.5">Inactive</p>
          </div>
        </div>

        {/* Pending collectors */}
        {pending.length > 0 && (
          <div className="bg-clay/10 border border-clay/20 rounded-2xl p-5 mb-4">
            <h2 className="font-display text-sm font-medium text-clay mb-3">⚠️ Awaiting approval ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map(c => <CollectorCard key={c.id} collector={c} />)}
            </div>
          </div>
        )}

        {/* Active collectors */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5 mb-4">
          <h2 className="font-display text-sm font-medium text-charcoal mb-3">✅ Active collectors ({active.length})</h2>
          {active.length === 0 ? (
            <p className="text-charcoal/40 text-xs text-center py-4">No active collectors yet.</p>
          ) : (
            <div className="space-y-3">
              {active.map(c => <CollectorCard key={c.id} collector={c} />)}
            </div>
          )}
        </div>

        {/* Inactive collectors */}
        {inactive.length > 0 && (
          <div className="bg-charcoal/10 border border-charcoal/15 rounded-2xl p-5">
            <h2 className="font-display text-sm font-medium text-charcoal mb-3">🔒 Inactive collectors ({inactive.length})</h2>
            <div className="space-y-3">
              {inactive.map(c => <CollectorCard key={c.id} collector={c} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Collectors