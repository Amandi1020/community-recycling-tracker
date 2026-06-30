import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import adminDashboardImg from '../../assets/illustrations/users.jpeg'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
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
    fetchUsers()
  }, [])

  const filtered = filter === 'all' ? users
    : ['pending', 'inactive', 'active'].includes(filter)
    ? users.filter(u => u.status === filter)
    : users.filter(u => u.role === filter)

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
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="bg-forest rounded-2xl overflow-hidden mb-5 flex items-stretch">
          <div className="p-7 flex-1 flex flex-col justify-center">
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Manage users</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              View and manage all registered residents, collectors and admins in the system.
            </p>
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img
              src={adminDashboardImg}
              alt="Users illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{users.length}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Total users</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">
              {users.filter(u => u.role === 'resident').length}
            </p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Residents</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">
              {users.filter(u => u.role === 'collector').length}
            </p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Collectors</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'resident', 'collector', 'admin', 'pending', 'inactive'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition
                ${filter === role
                  ? 'bg-forest text-sage'
                  : 'bg-white/60 text-charcoal/60 border border-moss/20 hover:border-moss/40'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest text-sage">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">District</th>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Points</th>
                <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white/40' : 'bg-white/20'}>
                  <td className="px-5 py-3 font-medium text-charcoal">{user.name}</td>
                  <td className="px-5 py-3 text-charcoal/55 text-xs">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize
                      ${user.role === 'admin' ? 'bg-clay/20 text-clay' :
                        user.role === 'collector' ? 'bg-moss/20 text-moss' :
                        'bg-forest/10 text-forest'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-charcoal/55 text-xs">{user.district}</td>
                  <td className="px-5 py-3 text-charcoal font-medium">{user.points}</td>
                  <td className="px-5 py-3 text-charcoal/45 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Users