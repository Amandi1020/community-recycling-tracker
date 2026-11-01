import db from '../config/db.js'
import ApiError from '../utils/ApiError.js'
import withTransaction from '../utils/transaction.js'
import { createNotification } from '../utils/notify.js'
import { logAudit } from '../utils/audit.js'
import {
  parsePagination,
  parseSearch,
  requireEnum,
  requireId,
  validateCategoryInput,
  validateStatus
} from '../utils/validation.js'

const ROLES = ['resident', 'collector', 'admin']
const STATUSES = ['active', 'pending', 'inactive']

export const getDashboard = async (req, res) => {
  const [residents] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'resident'")
  const [collectors] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'collector'")
  const [listings] = await db.execute('SELECT COUNT(*) AS count FROM listings')
  const [totalKg] = await db.execute(
    `SELECT COALESCE(SUM(COALESCE(cl.weight_kg, l.weight_kg)), 0) AS total_kg
     FROM claims cl
     JOIN listings l ON l.id = cl.listing_id
     WHERE cl.status = 'collected'`
  )
  const [districtStats] = await db.execute(
    `SELECT
       u.district,
       COUNT(l.id) AS total_listings,
       COALESCE(SUM(CASE WHEN l.status = 'collected' THEN l.weight_kg ELSE 0 END), 0) AS total_kg
     FROM users u
     LEFT JOIN listings l ON l.user_id = u.id
     WHERE u.role = 'resident'
     GROUP BY u.district
     ORDER BY total_kg DESC`
  )
  const [categoryStats] = await db.execute(
    `SELECT
       c.name,
       COUNT(l.id) AS total_listings,
       COALESCE(SUM(CASE WHEN l.status = 'collected' THEN l.weight_kg ELSE 0 END), 0) AS total_kg
     FROM categories c
     LEFT JOIN listings l ON l.category_id = c.id
     GROUP BY c.id, c.name`
  )
  const [monthlyStats] = await db.execute(
    `SELECT month, total_kg, total_collections FROM (
       SELECT
         DATE_FORMAT(cl.collected_at, '%b %Y') AS month,
         COALESCE(SUM(COALESCE(cl.weight_kg, l.weight_kg)), 0) AS total_kg,
         COUNT(cl.id) AS total_collections,
         MIN(cl.collected_at) AS first_collected
       FROM claims cl
       JOIN listings l ON l.id = cl.listing_id
       WHERE cl.status = 'collected'
       GROUP BY DATE_FORMAT(cl.collected_at, '%b %Y')
       ORDER BY first_collected DESC
       LIMIT 6
     ) AS recent
     ORDER BY first_collected ASC`
  )
  const [pendingCollectors] = await db.execute(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'collector' AND status = 'pending'"
  )

  res.json({
    total_residents: residents[0].count,
    total_collectors: collectors[0].count,
    total_listings: listings[0].count,
    total_kg: totalKg[0].total_kg,
    pending_collectors: pendingCollectors[0].count,
    districtStats,
    categoryStats,
    monthlyStats
  })
}

export const getUsers = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query)
  const search = parseSearch(req.query)
  const role = req.query.role && req.query.role !== 'all'
    ? requireEnum(req.query.role, 'Role', ROLES)
    : null
  const status = req.query.status && req.query.status !== 'all'
    ? requireEnum(req.query.status, 'Status', STATUSES)
    : null

  const filters = []
  const params = []

  if (search) {
    filters.push('(name LIKE ? OR email LIKE ? OR district LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }
  if (role) {
    filters.push('role = ?')
    params.push(role)
  }
  if (status) {
    filters.push('status = ?')
    params.push(status)
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''

  const [rows] = await db.execute(
    `SELECT id, name, email, role, district, points, level, status, created_at
     FROM users
     ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  )

  const [summaryRows] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(role = 'resident'), 0) AS residents,
       COALESCE(SUM(role = 'collector'), 0) AS collectors,
       COALESCE(SUM(status = 'pending'), 0) AS pending,
       COALESCE(SUM(status = 'inactive'), 0) AS inactive
     FROM users`
  )

  const total = countRows[0].total
  res.json({
    data: rows,
    summary: summaryRows[0],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  })
}

export const updateUserStatus = async (req, res) => {
  const userId = requireId(req.params.userId, 'User id')
  const status = validateStatus(req.body.status)

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      'SELECT id, name, role, status FROM users WHERE id = ? FOR UPDATE',
      [userId]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'User not found')
    }

    const target = rows[0]
    if (target.role === 'admin') {
      throw new ApiError(400, 'Admin accounts cannot be modified from this endpoint')
    }
    if (target.id === req.user.id && status !== 'active') {
      throw new ApiError(400, 'You cannot deactivate your own account')
    }

    await connection.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId])

    if (target.role === 'collector' && status === 'active' && target.status !== 'active') {
      await createNotification(connection, target.id, {
        type: 'collector_approved',
        message: 'Your collector account has been approved. You can now claim pickups.',
        link: '/collector/browse'
      })
    }

    await logAudit(connection, req.user.id, 'user.status_changed', 'user', target.id, {
      name: target.name,
      from: target.status,
      to: status
    })
  })

  res.json({ message: 'User status updated' })
}

export const deleteUser = async (req, res) => {
  const userId = requireId(req.params.userId, 'User id')

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? FOR UPDATE',
      [userId]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'User not found')
    }

    const target = rows[0]
    if (target.role === 'admin') {
      throw new ApiError(400, 'Admin accounts cannot be deleted')
    }
    if (target.id === req.user.id) {
      throw new ApiError(400, 'You cannot delete your own account')
    }

    await connection.execute('DELETE FROM notifications WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId])
    await connection.execute(
      'DELETE FROM collector_ratings WHERE resident_id = ? OR collector_id = ?',
      [userId, userId]
    )
    await connection.execute('DELETE FROM user_badges WHERE user_id = ?', [userId])
    await connection.execute(
      `UPDATE listings l
       JOIN claims cl ON cl.listing_id = l.id
       SET l.status = 'available'
       WHERE cl.collector_id = ? AND cl.status = 'claimed' AND l.status = 'claimed'`,
      [userId]
    )
    await connection.execute(
      `DELETE FROM claims
       WHERE collector_id = ?
          OR listing_id IN (SELECT id FROM listings WHERE user_id = ?)`,
      [userId, userId]
    )
    await connection.execute(
      `DELETE FROM listing_photos
       WHERE listing_id IN (SELECT id FROM listings WHERE user_id = ?)`,
      [userId]
    )
    await connection.execute('DELETE FROM listings WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM users WHERE id = ?', [userId])

    await logAudit(connection, req.user.id, 'user.deleted', 'user', userId, {
      name: target.name,
      email: target.email,
      role: target.role
    })
  })

  res.json({ message: 'User deleted' })
}

export const getCategories = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM categories ORDER BY id ASC')
  res.json(rows)
}

export const createCategory = async (req, res) => {
  const data = validateCategoryInput(req.body)

  const category = await withTransaction(async connection => {
    const [result] = await connection.execute(
      'INSERT INTO categories (name, points_per_kg, co2_per_kg) VALUES (?, ?, ?)',
      [data.name, data.points_per_kg, data.co2_per_kg]
    )
    await logAudit(connection, req.user.id, 'category.created', 'category', result.insertId, data)
    return { id: result.insertId, ...data }
  })

  res.status(201).json({ message: 'Category created', category })
}

export const updateCategory = async (req, res) => {
  const categoryId = requireId(req.params.categoryId, 'Category id')
  const data = validateCategoryInput(req.body, { partial: true })

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      'SELECT id, name, points_per_kg, co2_per_kg FROM categories WHERE id = ? FOR UPDATE',
      [categoryId]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Category not found')
    }

    const fields = []
    const params = []
    for (const key of ['name', 'points_per_kg', 'co2_per_kg']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`)
        params.push(data[key])
      }
    }

    if (fields.length > 0) {
      params.push(categoryId)
      await connection.execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params)
    }

    await logAudit(connection, req.user.id, 'category.updated', 'category', categoryId, {
      before: rows[0],
      after: data
    })
  })

  res.json({ message: 'Category updated' })
}

export const deleteCategory = async (req, res) => {
  const categoryId = requireId(req.params.categoryId, 'Category id')

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      'SELECT id, name FROM categories WHERE id = ? FOR UPDATE',
      [categoryId]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Category not found')
    }

    const [used] = await connection.execute(
      'SELECT COUNT(*) AS count FROM listings WHERE category_id = ?',
      [categoryId]
    )
    if (used[0].count > 0) {
      throw new ApiError(409, 'This category is used by existing listings and cannot be deleted')
    }

    await connection.execute('DELETE FROM categories WHERE id = ?', [categoryId])
    await logAudit(connection, req.user.id, 'category.deleted', 'category', categoryId, {
      name: rows[0].name
    })
  })

  res.json({ message: 'Category deleted' })
}

export const getAuditLogs = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query)

  const [rows] = await db.execute(
    `SELECT al.id, al.actor_id, u.name AS actor_name, al.action, al.entity_type,
       al.entity_id, al.details, al.created_at
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.actor_id
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  )

  const [countRows] = await db.execute('SELECT COUNT(*) AS total FROM audit_logs')
  const total = countRows[0].total

  res.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  })
}
