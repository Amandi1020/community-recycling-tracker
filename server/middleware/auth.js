import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import env from '../config/env.js'
import ApiError from '../utils/ApiError.js'

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next(new ApiError(401, 'Authentication required'))
  }

  let decoded
  try {
    decoded = jwt.verify(token, env.JWT_SECRET)
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'))
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, district, points, level, status, password_changed_at FROM users WHERE id = ?',
      [decoded.id]
    )

    if (rows.length === 0) {
      return next(new ApiError(401, 'Account no longer exists'))
    }

    const user = rows[0]

    if (user.status !== 'active') {
      const message = user.status === 'pending'
        ? 'Your account is pending admin approval'
        : 'Your account has been deactivated'
      return next(new ApiError(403, message, 'ACCOUNT_NOT_ACTIVE'))
    }

    if (user.password_changed_at) {
      const changedAt = new Date(user.password_changed_at).getTime()
      if (decoded.iat * 1000 < changedAt - 1000) {
        return next(new ApiError(401, 'Password changed. Please log in again.', 'PASSWORD_CHANGED'))
      }
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}


export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'))
  }
  next()
}

export default verifyToken
