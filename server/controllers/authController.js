import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

export const register = async (req, res) => {
  const { name, email, password, role, district } = req.body

  try {
    const [existing] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const status = role === 'collector' ? 'pending' : 'active'

    await db.execute(
      'INSERT INTO users (name, email, password_hash, role, district, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, role, district, status]
    )

    const message = role === 'collector'
      ? 'Registration successful! Your account is pending admin approval.'
      : 'Registration successful!'

    res.status(201).json({ message })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const user = users[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait.' })
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact admin.' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, district: user.district },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        points: user.points,
        level: user.level
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}