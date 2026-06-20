import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

// Register
export const register = async (req, res) => {
  const { name, email, password, role, district } = req.body

  try {
    // Check if email already exists
    const [existing] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10)

    // Insert new user
    await db.execute(
      'INSERT INTO users (name, email, password_hash, role, district) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, role, district]
    )

    res.status(201).json({ message: 'Registration successful!' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Login
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const user = users[0]
    

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Create JWT token
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

    