import { useCallback, useEffect, useState } from 'react'
import axios from '../utils/axios'
import { AuthContext } from './authContext'

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setReady(true)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const login = useCallback((userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    setReady(true)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
  }, [])

  useEffect(() => {
    let cancelled = false

    const verifySession = async () => {
      if (!token) {
        setReady(true)
        return
      }

      try {
        const res = await axios.get('/auth/me')
        if (!cancelled) {
          setUser(res.data.user)
          localStorage.setItem('user', JSON.stringify(res.data.user))
        }
      } catch (err) {
        if (!cancelled && err.response?.status === 401) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    verifySession()

    return () => {
      cancelled = true
    }
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
