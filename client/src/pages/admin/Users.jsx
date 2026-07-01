import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import adminDashboardImg from '../../assets/illustrations/users.jpeg'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleStatusChange = async (userId, status) => {
    setActionLoading(userId)
    try {
      await axios.put(`/admin/users/${userId}/status`, { status })
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u))
      showMessage(`User ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'updated'} successfully`)
    } catch (err) {
      showMessage('Failed to update user status', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete "${userName}"? This cannot be undone.`)) return
    setActionLoading(userId)
    try {
      await axios.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      showMessage('User deleted successfully')
    } catch (err) {
      showMessage('Failed to delete user', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    const matchSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.district.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchStatus && matchSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Manage users</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Search, filter, approve, deactivate and delete user accounts across all roles.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img src={adminDashboardImg} alt="Admin" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${
            message.type === 'error'
              ? 'bg-clay/10 border-clay/20 text-clay'
              : 'bg-moss/20 border-moss/30 text-forest'
          }`}>
            {message.type === 'error' ? '❌' : '✅'} {message.text}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-xl font-medium text-sage">{users.length}</p>
            <p className="text-[10px] text-sage/55 uppercase tracking-wide mt-0.5">Total</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-xl font-medium text-white">{users.filter(u => u.role === 'resident').length}</p>
            <p className="text-[10px] text-white/65 uppercase tracking-wide mt-0.5">Residents</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-xl font-medium text-white">{users.filter(u => u.role === 'collector').length}</p>
            <p className="text-[10px] text-white/65 uppercase tracking-wide mt-0.5">Collectors</p>
          </div>
          <div className="bg-clay/60 rounded-xl p-4 text-center">
            <p className="font-display text-xl font-medium text-white">{users.filter(u => u.status === 'pending').length}</p>
            <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">Pending</p>
          </div>
          <div className="bg-charcoal/60 rounded-xl p-4 text-center">
            <p className="font-display text-xl font-medium text-sage">{users.filter(u => u.status === 'inactive').length}</p>
            <p className="text-[10px] text-sage/60 uppercase tracking-wide mt-0.5">Inactive</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-4 mb-4">
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/70 border border-moss/20 rounded-xl pl-9 pr-4 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-moss/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-charcoal/40 uppercase tracking-wide self-center">Role:</span>
            {['all', 'resident', 'collector', 'admin'].map(role => (
              <button key={role} onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition
                  ${roleFilter === role ? 'bg-forest text-sage' : 'bg-white/60 text-charcoal/60 border border-moss/20 hover:border-moss/40'}`}>
                {role}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] text-charcoal/40 uppercase tracking-wide self-center">Status:</span>
            {['all', 'active', 'pending', 'inactive'].map(status => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition
                  ${statusFilter === status
                    ? status === 'pending' ? 'bg-clay text-white'
                    : status === 'inactive' ? 'bg-charcoal/70 text-sage'
                    : 'bg-forest text-sage'
                    : 'bg-white/60 text-charcoal/60 border border-moss/20 hover:border-moss/40'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-charcoal/45 mb-3">Showing {filtered.length} of {users.length} users</p>

        {/* Users list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-moss/20 rounded-2xl border border-moss/25 p-12 text-center">
              <p className="text-3xl mb-3">👥</p>
              <p className="text-charcoal/50 text-sm">No users match your current filters.</p>
            </div>
          ) : (
            filtered.map(user => (
              <div key={user.id} className="bg-white/60 border border-moss/15 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-sage font-display font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-sm">{user.name}</p>
                  <p className="text-xs text-charcoal/50">{user.email} · {user.district}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize
                      ${user.role === 'admin' ? 'bg-clay/20 text-clay' :
                        user.role === 'collector' ? 'bg-moss/20 text-moss' : 'bg-forest/10 text-forest'}`}>
                      {user.role}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize
                      ${user.status === 'active' ? 'bg-moss/15 text-moss' :
                        user.status === 'pending' ? 'bg-clay/20 text-clay' : 'bg-charcoal/10 text-charcoal/50'}`}>
                      {user.status || 'active'}
                    </span>
                    <span className="text-[10px] text-charcoal/40">{user.points} pts · joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {user.status === 'pending' && (
                    <button onClick={() => handleStatusChange(user.id, 'active')} disabled={actionLoading === user.id}
                      className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/90 transition disabled:opacity-50">
                      ✅ Approve
                    </button>
                  )}
                  {(user.status === 'active' || !user.status) && user.role !== 'admin' && (
                    <button onClick={() => handleStatusChange(user.id, 'inactive')} disabled={actionLoading === user.id}
                      className="bg-charcoal/15 text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-charcoal/25 transition disabled:opacity-50">
                      🔒 Deactivate
                    </button>
                  )}
                  {user.status === 'inactive' && (
                    <button onClick={() => handleStatusChange(user.id, 'active')} disabled={actionLoading === user.id}
                      className="bg-moss/20 text-moss text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-moss/30 transition disabled:opacity-50">
                      🔓 Activate
                    </button>
                  )}
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user.id, user.name)} disabled={actionLoading === user.id}
                      className="bg-clay/15 text-clay text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-clay/25 transition disabled:opacity-50">
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Users