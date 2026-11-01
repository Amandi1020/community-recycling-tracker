import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/admin/audit-logs?limit=100')
        setLogs(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-forest rounded-2xl p-7 mb-5">
          <h1 className="font-display text-2xl font-medium text-sage mb-1">Audit logs</h1>
          <p className="text-sage/65 text-sm">Recent administrative actions recorded by the system.</p>
        </div>

        {error && (
          <div className="bg-clay/10 text-clay border border-clay/20 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-5">
          {logs.length === 0 ? (
            <p className="text-center text-charcoal/50 text-sm py-8">No audit events yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="bg-white/60 border border-moss/15 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{log.action}</p>
                      <p className="text-xs text-charcoal/50">
                        {log.actor_name || 'System'} · {log.entity_type}
                        {log.entity_id ? ` #${log.entity_id}` : ''}
                      </p>
                    </div>
                    <p className="text-[10px] text-charcoal/40 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  {log.details && (
                    <pre className="mt-2 text-[10px] text-charcoal/55 bg-forest/5 rounded-lg p-2 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
