import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import env from '../config/env.js'
import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'
import { notifyAdmins } from '../utils/notify.js'
import {
  validateRegister,
  validateLogin,
  validateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} from '../utils/validation.js'

const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q5Y7xJ8iZ0o5b6c7d8e9f0g1h2i3j'

const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  district: user.district,
  points: user.points,
  level: user.level,
  status: user.status
})

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex')

export const register = async (req, res) => {
  const data = validateRegister(req.body)

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [data.email])
  if (existing.length > 0) {
    throw new ApiError(409, 'Email already registered')
  }

  const passwordHash = await bcrypt.hash(data.password, 10)
  const status = data.role === 'collector' ? 'pending' : 'active'
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, district, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.email, passwordHash, data.role, data.district, status]
    )

    if (data.role === 'collector') {
      await notifyAdmins(connection, {
        type: 'collector_pending',
        message: `${data.name} registered as a collector in ${data.district} and needs approval.`,
        link: '/admin/collectors'
      })
    }

    await connection.commit()

    const message = data.role === 'collector'
      ? 'Registration successful. Your account is pending admin approval.'
      : 'Registration successful.'

    res.status(201).json({ message, userId: result.insertId })
  } catch (err) {
    await connection.rollback()
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Email already registered')
    }
    throw err
  } finally {
    connection.release()
  }
}

export const login = async (req, res) => {
  const data = validateLogin(req.body)

  const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [data.email])
  if (users.length === 0) {
    await bcrypt.compare(data.password, DUMMY_HASH)
    throw new ApiError(401, 'Invalid email or password')
  }

  const user = users[0]
  const isMatch = await bcrypt.compare(data.password, user.password_hash)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.status === 'pending') {
    throw new ApiError(403, 'Your account is pending admin approval. Please wait.')
  }
  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account has been deactivated. Please contact an admin.')
  }

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })

  res.json({ token, user: publicUser(user) })
}

export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) })
}

export const updateProfile = async (req, res) => {
  const data = validateProfile(req.body)

  await db.execute('UPDATE users SET name = ?, district = ? WHERE id = ?', [
    data.name,
    data.district,
    req.user.id
  ])

  const [rows] = await db.execute(
    'SELECT id, name, email, role, district, points, level, status FROM users WHERE id = ?',
    [req.user.id]
  )

  res.json({ message: 'Profile updated', user: publicUser(rows[0]) })
}

export const changePassword = async (req, res) => {
  const data = validateChangePassword(req.body)

  const [rows] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id])
  const isMatch = await bcrypt.compare(data.currentPassword, rows[0].password_hash)
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10)
  await db.execute(
    'UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?',
    [passwordHash, req.user.id]
  )
  await db.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [req.user.id])

  res.json({ message: 'Password changed. Please log in again.' })
}

export const forgotPassword = async (req, res) => {
  const data = validateForgotPassword(req.body)

  const [users] = await db.execute('SELECT id, name, email FROM users WHERE email = ?', [data.email])
  const response = { message: 'If that email exists, a password reset link has been created.' }

  if (users.length === 0) {
    return res.json(response)
  }

  const user = users[0]
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`

  await db.execute('DELETE FROM password_reset_tokens WHERE user_id = ? AND expires_at < NOW()', [user.id])
  await db.execute(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
    [user.id, tokenHash]
  )

  if (env.IS_PRODUCTION) {
    logger.info(`Password reset requested for user ${user.id}. Configure an email provider to deliver reset links.`)
  } else {
    logger.info(`Password reset link for ${user.email}: ${resetUrl}`)
    response.devResetToken = token
    response.devResetUrl = resetUrl
  }

  res.json(response)
}

export const resetPassword = async (req, res) => {
  const data = validateResetPassword(req.body)
  const tokenHash = hashToken(data.token)

  const [tokens] = await db.execute(
    `SELECT prt.id, prt.user_id
     FROM password_reset_tokens prt
     WHERE prt.token_hash = ? AND prt.used_at IS NULL AND prt.expires_at > NOW()`,
    [tokenHash]
  )

  if (tokens.length === 0) {
    throw new ApiError(400, 'This reset link is invalid or has expired')
  }

  const reset = tokens[0]
  const passwordHash = await bcrypt.hash(data.password, 10)
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()
    await connection.execute(
      'UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?',
      [passwordHash, reset.user_id]
    )
    await connection.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [reset.id])
    await connection.execute('DELETE FROM password_reset_tokens WHERE user_id = ? AND id <> ?', [
      reset.user_id,
      reset.id
    ])
    await connection.commit()
    res.json({ message: 'Password reset successful. You can now log in.' })
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}
