import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

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

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-forest rounded-2xl p-8 mb-6">
          <h1 className="font-display text-3xl font-medium text-sage mb-1">Manage users</h1>
          <p className="text-sage/65 text-sm">All registered users in the system</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'resident', 'collector', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition
                ${filter === role
                  ? 'bg-forest text-sage'
                  : 'bg-white text-charcoal/60 border border-charcoal/10 hover:border-moss/40'}`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sage text-charcoal/70">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">District</th>
                <th className="text-left px-6 py-3 font-medium">Points</th>
                <th className="text-left px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-t border-charcoal/8">
                  <td className="px-6 py-3 font-medium text-charcoal">{user.name}</td>
                  <td className="px-6 py-3 text-charcoal/55">{user.email}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize
                      ${user.role === 'admin' ? 'bg-clay/15 text-clay' :
                        user.role === 'collector' ? 'bg-moss/15 text-moss' :
                        'bg-sage text-moss'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-charcoal/55">{user.district}</td>
                  <td className="px-6 py-3 text-charcoal font-medium">{user.points}</td>
                  <td className="px-6 py-3 text-charcoal/45">{new Date(user.created_at).toLocaleDateString()}</td>
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