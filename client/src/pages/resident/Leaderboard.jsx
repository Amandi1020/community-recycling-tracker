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
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-green-700 text-lg font-medium animate-pulse">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">🏆 District Leaderboard</h1>
          <p className="text-gray-500 mt-1">{user?.district} — Top Recyclers</p>
        </div>

        {leaders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-gray-500">No recyclers yet in your district. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div
                key={leader.id}
                className={`bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 ${leader.id === user?.id ? 'border-2 border-green-400' : ''}`}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-green-50 text-green-600'}`}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>

                {/* Name & Level */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {leader.name} {leader.id === user?.id ? '(You)' : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {levelEmoji[leader.level]} {leader.level}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="font-bold text-green-600">{leader.points} pts</p>
                  <p className="text-sm text-gray-500">{leader.total_kg} kg recycled</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Leaderboard