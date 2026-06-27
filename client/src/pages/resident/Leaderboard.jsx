import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import axios from '../../utils/axios'
import { useAuth } from '../../context/AuthContext'

const levelEmoji = {
  'Seedling': '🌱',
  'Sprout': '🌿',
  'Guardian': '🌳',
  'Eco Hero': '🏆'
}

const Leaderboard = () => {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/resident/leaderboard')
        setLeaders(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-moss text-sm font-medium animate-pulse">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const top3 = leaders.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  const podiumStyles = [
    { height: 'h-24', bg: 'bg-charcoal/30', label: '2nd', medal: '🥈', textSize: 'text-lg' },
    { height: 'h-32', bg: 'bg-clay/80', label: '1st', medal: '🥇', textSize: 'text-xl' },
    { height: 'h-16', bg: 'bg-moss', label: '3rd', medal: '🥉', textSize: 'text-base' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage to-cream">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Hero banner */}
        <div className="bg-forest rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <span className="absolute top-4 left-8 text-sage/20 text-4xl">★</span>
          <span className="absolute top-8 right-12 text-sage/15 text-2xl">★</span>
          <span className="absolute bottom-4 left-16 text-clay/30 text-3xl">★</span>
          <span className="absolute bottom-6 right-8 text-sage/20 text-xl">★</span>

          <p className="text-clay text-xs uppercase tracking-widest font-medium mb-2 relative z-10">
            {user?.district} District
          </p>
          <h1 className="font-display text-4xl font-medium text-sage mb-2 relative z-10">
            Top Recyclers
          </h1>
          <p className="text-sage/60 text-sm relative z-10">
            The greenest heroes in your community this season
          </p>
          <div className="mt-4 flex justify-center gap-2 relative z-10">
            <span className="px-3 py-1 bg-sage/10 text-sage text-xs rounded-full border border-sage/20">
              ♻️ Points earned by weight recycled
            </span>
          </div>
        </div>

        {/* Podium — top 3 */}
        {top3.length > 0 && (
          <div className="bg-moss/20 rounded-2xl border border-moss/25 p-8 mb-5">
            <p className="text-center text-xs text-forest/60 uppercase tracking-widest mb-6">Podium</p>

            <div className="flex justify-center items-end gap-6 mb-2">
              {podiumOrder.map((leader, i) => {
                const style = podiumStyles[i]
                const isYou = leader?.id === user?.id
                return leader ? (
                  <div key={leader.id} className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{style.medal}</span>
                    <div className={`w-14 h-14 rounded-full bg-forest flex items-center justify-center text-sage font-display font-semibold text-lg border-2 ${isYou ? 'border-clay' : 'border-moss/40'}`}>
                      {leader.name.charAt(0).toUpperCase()}
                    </div>
                    <p className={`font-medium text-charcoal text-center leading-tight ${style.textSize} max-w-[80px] truncate`}>
                      {leader.name}{isYou ? ' 👋' : ''}
                    </p>
                    <p className="text-xs text-charcoal/50">{leader.points} pts</p>
                  </div>
                ) : null
              })}
            </div>

            <div className="flex justify-center items-end gap-6 mt-1">
              {podiumOrder.map((leader, i) => {
                const style = podiumStyles[i]
                return leader ? (
                  <div key={`block-${leader.id}`} className={`w-20 ${style.height} ${style.bg} rounded-t-xl flex items-center justify-center`}>
                    <span className="text-white/90 font-display font-medium text-sm">{style.label}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Full rankings list */}
        <div className="bg-moss/20 rounded-2xl border border-moss/25 p-6">
          <p className="text-xs text-forest/60 uppercase tracking-widest mb-4">Full rankings</p>

          {leaders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-charcoal/50 text-sm">No recyclers yet in your district — be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaders.map((leader, index) => (
                <div
                  key={leader.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition
                    ${leader.id === user?.id
                      ? 'bg-forest/20 border border-moss/40'
                      : 'bg-moss/10 border border-moss/15'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                    ${index === 0 ? 'bg-clay/30 text-clay' :
                      index === 1 ? 'bg-charcoal/15 text-charcoal/60' :
                      index === 2 ? 'bg-moss/30 text-moss' :
                      'bg-forest/10 text-charcoal/50'}`}
                  >
                    {index + 1}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-sage font-display font-semibold flex-shrink-0">
                    {leader.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal text-sm truncate">
                      {leader.name} {leader.id === user?.id ? '(You)' : ''}
                    </p>
                    <p className="text-xs text-charcoal/45">
                      {levelEmoji[leader.level]} {leader.level} · {leader.total_kg} kg recycled
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-medium text-forest text-sm">{leader.points}</p>
                    <p className="text-[10px] text-charcoal/40 uppercase tracking-wide">pts</p>
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

export default Leaderboard