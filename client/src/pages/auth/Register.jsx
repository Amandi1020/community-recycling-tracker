import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../../utils/axios'

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
]

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    district: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest relative overflow-hidden flex-col justify-between p-12">
        <svg className="absolute -right-32 -top-32 w-[500px] h-[500px] opacity-90" viewBox="0 0 200 200">
          <path fill="#3D7A5C" d="M45.3,-58.5C58.6,-49.5,69.2,-35.4,73.8,-19.5C78.4,-3.7,77,13.9,69.5,28.4C62,42.9,48.4,54.2,33.2,61.6C17.9,69,1,72.5,-16.5,71.2C-34,69.9,-52.1,63.8,-63.6,51.2C-75.1,38.6,-80,19.3,-78.7,1C-77.4,-17.4,-69.9,-34.8,-57.6,-44.4C-45.3,-54.1,-28.2,-56,-11.7,-58.6C4.9,-61.2,32,-67.5,45.3,-58.5Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -left-20 bottom-0 w-72 h-72 opacity-40" viewBox="0 0 200 200">
          <path fill="#D97B4A" d="M39.5,-50.6C50.6,-41.6,58.7,-28.9,61.8,-14.8C64.9,-0.7,63,15.8,55.4,28.9C47.8,42,34.5,51.7,19.7,57.2C4.9,62.7,-11.4,64,-26.2,59.3C-41,54.6,-54.3,43.9,-61.4,30C-68.5,16.1,-69.4,-1,-64.5,-15.8C-59.6,-30.6,-48.9,-43.1,-36,-51.8C-23.1,-60.5,-7.9,-65.4,5.6,-72.1C19.1,-78.8,28.4,-59.6,39.5,-50.6Z" transform="translate(100 100)" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <span className="font-display text-2xl font-semibold text-sage">EcoTrack</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-medium text-sage leading-tight mb-4">
            Join your<br />district's green<br />movement.
          </h1>
          <p className="text-sage/70 text-base max-w-sm">
            Whether you're giving away recyclables or collecting them, your account starts your impact story.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <span className="px-3 py-1 bg-sage/10 text-sage text-xs rounded-full border border-sage/20">🌱 Seedling</span>
          <span className="px-3 py-1 bg-sage/10 text-sage text-xs rounded-full border border-sage/20">🌿 Sprout</span>