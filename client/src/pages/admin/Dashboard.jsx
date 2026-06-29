import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import adminDashboardImg from '../../assets/illustrations/admin-dashboard.jpeg'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts'

const COLORS = ['#4A6B4D', '#6B8E5A', '#D97B4A', '#88A77A', '#A66B3F']

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/dashboard')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading...</p>
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
            <h1 className="font-display text-2xl font-medium text-sage mb-1">Admin dashboard</h1>
            <p className="text-sage/65 text-sm leading-relaxed">
              Monitor system-wide recycling activity, user growth and district performance.
            </p>
            {stats?.pending_collectors > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-clay/20 text-clay text-xs font-medium px-3 py-1.5 rounded-full w-fit">
                ⚠️ {stats.pending_collectors} collector{stats.pending_collectors > 1 ? 's' : ''} awaiting approval
              </div>
            )}
          </div>
          <div className="w-40 bg-white flex items-center justify-center p-3 hidden sm:flex">
            <img src={adminDashboardImg} alt="Admin" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="bg-forest rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_residents || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Residents</p>
          </div>
          <div className="bg-moss rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_collectors || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Collectors</p>
          </div>
          <div className="bg-clay rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.total_listings || 0}</p>
            <p className="text-[11px] text-white/65 uppercase tracking-wide mt-0.5">Listings</p>
          </div>
          <div className="bg-charcoal/70 rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-sage">{stats?.total_kg || 0}</p>
            <p className="text-[11px] text-sage/55 uppercase tracking-wide mt-0.5">Kg recycled</p>
          </div>
          <div className="bg-clay/60 rounded-xl p-4 text-center">
            <p className="font-display text-2xl font-medium text-white">{stats?.pending_collectors || 0}</p>
            <p className="text-[11px] text-white/70 uppercase tracking-wide mt-0.5">Pending</p>
          </div>
        </div>

        {/* Charts row — Bar + Pie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
            <h2 className="font-display text-sm font-medium text-charcoal mb-3">Listings by district</h2>
            {stats?.districtStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.districtStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="district" tick={{ fontSize: 9, fill: '#2B2E2899' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#2B2E2899' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #6B8E5A30', fontSize: 11 }} />
                  <Bar dataKey="total_listings" fill="#4A6B4D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10"><p className="text-charcoal/40 text-xs">No data yet.</p></div>
            )}
          </div>

          <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
            <h2 className="font-display text-sm font-medium text-charcoal mb-3">Items by category</h2>
            {stats?.categoryStats?.some(c => c.total_listings > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.categoryStats.filter(c => c.total_listings > 0)}
                    dataKey="total_listings"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={70} paddingAngle={3}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #6B8E5A30', fontSize: 11 }} />
                  <Legend formatter={(value) => <span style={{ color: '#2B2E28', fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10"><p className="text-charcoal/40 text-xs">No data yet.</p></div>
            )}
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5 mb-4">
          <h2 className="font-display text-sm font-medium text-charcoal mb-3">Monthly recycling trend (kg)</h2>
          {stats?.monthlyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.monthlyStats} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6B8E5A20" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#2B2E2899' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#2B2E2899' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #6B8E5A30', fontSize: 11 }} />
                <Line type="monotone" dataKey="total_kg" stroke="#D97B4A" strokeWidth={2.5} dot={{ fill: '#D97B4A', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8"><p className="text-charcoal/40 text-xs">No recycling data yet.</p></div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5 mb-4">
          <h2 className="font-display text-sm font-medium text-charcoal mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a href="/admin/users" className="bg-forest text-sage text-center text-xs font-medium py-2.5 rounded-xl hover:bg-forest/90 transition">👥 Manage users</a>
            <a href="/admin/collectors" className="bg-moss text-white text-center text-xs font-medium py-2.5 rounded-xl hover:bg-moss/90 transition">🚛 Approve collectors</a>
            <a href="/admin/categories" className="bg-clay text-white text-center text-xs font-medium py-2.5 rounded-xl hover:bg-clay/90 transition">⚙️ Edit categories</a>
            <a href="/admin/users?filter=inactive" className="bg-charcoal/70 text-sage text-center text-xs font-medium py-2.5 rounded-xl hover:bg-charcoal/80 transition">🔒 Inactive users</a>
          </div>
        </div>

        {/* District table */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          <h2 className="font-display text-sm font-medium text-charcoal mb-3">District breakdown</h2>
          {!stats?.districtStats?.length ? (
            <div className="text-center py-6"><p className="text-charcoal/40 text-xs">No data yet.</p></div>
          ) : (
            <div className="space-y-2">
              {stats.districtStats.map(d => (
                <div key={d.district} className="bg-white/60 border border-moss/15 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="font-medium text-charcoal text-sm">{d.district}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-forest">{d.total_kg} kg</p>
                      <p className="text-[10px] text-charcoal/40">recycled</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-moss">{d.total_listings}</p>
                      <p className="text-[10px] text-charcoal/40">listings</p>
                    </div>
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

export default Dashboard