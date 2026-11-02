import db from '../config/db.js'
import ApiError from '../utils/ApiError.js'
import withTransaction from '../utils/transaction.js'
import { awardBadges } from '../utils/gamification.js'
import { createNotification } from '../utils/notify.js'
import {
  parsePagination,
  requireId,
  validateListingInput,
  validateRating
} from '../utils/validation.js'

const photoPath = listingId => `/api/listings/${listingId}/photo`

export const getDashboard = async (req, res) => {
  const userId = req.user.id

  const [statsRows] = await db.execute(
    `SELECT
       u.points AS total_points,
       u.level,
       COALESCE((
         SELECT SUM(COALESCE(cl.weight_kg, l.weight_kg))
         FROM claims cl
         JOIN listings l ON l.id = cl.listing_id
         WHERE l.user_id = u.id AND cl.status = 'collected'
       ), 0) AS total_kg,
       COALESCE((
         SELECT SUM(COALESCE(cl.co2_saved, l.weight_kg * c.co2_per_kg))
         FROM claims cl
         JOIN listings l ON l.id = cl.listing_id
         JOIN categories c ON c.id = l.category_id
         WHERE l.user_id = u.id AND cl.status = 'collected'
       ), 0) AS co2_saved
     FROM users u
     WHERE u.id = ?`,
    [userId]
  )

  const [chartRows] = await db.execute(
    `SELECT month, kg FROM (
       SELECT
         DATE_FORMAT(cl.collected_at, '%b %Y') AS month,
         COALESCE(SUM(COALESCE(cl.weight_kg, l.weight_kg)), 0) AS kg,
         MIN(cl.collected_at) AS first_collected
       FROM claims cl
       JOIN listings l ON l.id = cl.listing_id
       WHERE l.user_id = ? AND cl.status = 'collected'
       GROUP BY DATE_FORMAT(cl.collected_at, '%b %Y')
       ORDER BY first_collected DESC
       LIMIT 6
     ) AS recent
     ORDER BY first_collected ASC`,
    [userId]
  )

  const [badgeRows] = await db.execute(
    `SELECT b.id, b.name, b.description, b.icon
     FROM user_badges ub
     JOIN badges b ON ub.badge_id = b.id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at ASC`,
    [userId]
  )

  res.json({ stats: statsRows[0], chartData: chartRows, badges: badgeRows })
}

export const getCategories = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM categories ORDER BY id ASC')
  res.json(rows)
}

export const postListing = async (req, res) => {
  const data = validateListingInput(req.body)

  const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [data.category_id])
  if (categories.length === 0) {
    throw new ApiError(400, 'Selected category does not exist')
  }

  const listing = await withTransaction(async connection => {
    const [result] = await connection.execute(
      `INSERT INTO listings (user_id, category_id, item_name, weight_kg, address, available_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.category_id, data.item_name, data.weight_kg, data.address, data.available_time]
    )

    const listingId = result.insertId

    if (req.file) {
      await connection.execute(
        'INSERT INTO listing_photos (listing_id, mime_type, data) VALUES (?, ?, ?)',
        [listingId, req.file.mimetype, req.file.buffer]
      )
      await connection.execute('UPDATE listings SET photo_url = ? WHERE id = ?', [
        photoPath(listingId),
        listingId
      ])
    }

    const badges = await awardBadges(connection, req.user.id)
    return { id: listingId, badges }
  })

  res.status(201).json({ message: 'Item posted successfully', listing })
}

export const getMyListings = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query)

  const [rows] = await db.query(
    `SELECT
       l.*,
       c.name AS category_name,
       cl.id AS claim_id,
       cl.status AS claim_status,
       cl.collected_at,
       collector.name AS collector_name,
       cr.rating,
       cr.comment AS rating_comment
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     LEFT JOIN claims cl ON cl.listing_id = l.id
     LEFT JOIN users collector ON collector.id = cl.collector_id
     LEFT JOIN collector_ratings cr ON cr.claim_id = cl.id
     WHERE l.user_id = ?
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset]
  )

  const [countRows] = await db.execute(
    'SELECT COUNT(*) AS total FROM listings WHERE user_id = ?',
    [req.user.id]
  )

  const [summaryRows] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(status = 'available'), 0) AS available,
       COALESCE(SUM(status = 'claimed'), 0) AS claimed,
       COALESCE(SUM(status = 'collected'), 0) AS collected,
       COALESCE(SUM(CASE WHEN status = 'collected' THEN weight_kg ELSE 0 END), 0) AS kg_collected
     FROM listings WHERE user_id = ?`,
    [req.user.id]
  )

  const total = countRows[0].total
  res.json({
    data: rows,
    summary: summaryRows[0],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  })
}

export const getListing = async (req, res) => {
  const listingId = requireId(req.params.id, 'Listing id')

  const [rows] = await db.execute(
    `SELECT l.*, c.name AS category_name
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     WHERE l.id = ? AND l.user_id = ?`,
    [listingId, req.user.id]
  )

  if (rows.length === 0) {
    throw new ApiError(404, 'Listing not found')
  }

  res.json(rows[0])
}

export const updateListing = async (req, res) => {
  const listingId = requireId(req.params.id, 'Listing id')
  const data = validateListingInput(req.body, { partial: true })

  if (data.category_id !== undefined) {
    const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [data.category_id])
    if (categories.length === 0) {
      throw new ApiError(400, 'Selected category does not exist')
    }
  }

  const updated = await withTransaction(async connection => {
    const [rows] = await connection.execute(
      'SELECT id, status FROM listings WHERE id = ? AND user_id = ? FOR UPDATE',
      [listingId, req.user.id]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Listing not found')
    }
    if (rows[0].status !== 'available') {
      throw new ApiError(409, 'Only available listings can be edited')
    }

    const fields = []
    const params = []
    for (const key of ['item_name', 'category_id', 'weight_kg', 'address', 'available_time']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`)
        params.push(data[key])
      }
    }

    if (req.file) {
      await connection.execute(
        `INSERT INTO listing_photos (listing_id, mime_type, data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), data = VALUES(data)`,
        [listingId, req.file.mimetype, req.file.buffer]
      )
      fields.push('photo_url = ?')
      params.push(photoPath(listingId))
    } else if (data.remove_photo) {
      await connection.execute('DELETE FROM listing_photos WHERE listing_id = ?', [listingId])
      fields.push('photo_url = NULL')
    }

    if (fields.length > 0) {
      params.push(listingId, req.user.id)
      await connection.execute(
        `UPDATE listings SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      )
    }

    return listingId
  })

  res.json({ message: 'Listing updated', listingId: updated })
}

export const cancelListing = async (req, res) => {
  const listingId = requireId(req.params.id, 'Listing id')

  const [rows] = await db.execute(
    'SELECT id, status FROM listings WHERE id = ? AND user_id = ?',
    [listingId, req.user.id]
  )

  if (rows.length === 0) {
    throw new ApiError(404, 'Listing not found')
  }
  if (rows[0].status !== 'available') {
    throw new ApiError(409, 'Only available listings can be cancelled')
  }

  await db.execute("UPDATE listings SET status = 'cancelled' WHERE id = ?", [listingId])
  res.json({ message: 'Listing cancelled' })
}

export const getLeaderboard = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT
       u.id, u.name, u.points, u.level,
       COALESCE(kg.total_kg, 0) AS total_kg
     FROM users u
     LEFT JOIN (
       SELECT user_id, SUM(weight_kg) AS total_kg
       FROM listings
       WHERE status = 'collected'
       GROUP BY user_id
     ) kg ON kg.user_id = u.id
     WHERE u.district = ? AND u.role = 'resident' AND u.status = 'active'
     ORDER BY u.points DESC, total_kg DESC
     LIMIT 20`,
    [req.user.district]
  )

  res.json(rows)
}

export const rateCollector = async (req, res) => {
  const claimId = requireId(req.params.claimId, 'Claim id')
  const data = validateRating(req.body)

  const [claims] = await db.execute(
    `SELECT cl.id, cl.collector_id, l.item_name
     FROM claims cl
     JOIN listings l ON l.id = cl.listing_id
     WHERE cl.id = ? AND l.user_id = ? AND cl.status = 'collected'`,
    [claimId, req.user.id]
  )

  if (claims.length === 0) {
    throw new ApiError(404, 'Collected claim not found')
  }

  const claim = claims[0]

  try {
    await db.execute(
      'INSERT INTO collector_ratings (claim_id, resident_id, collector_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [claimId, req.user.id, claim.collector_id, data.rating, data.comment]
    )
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'You have already rated this collection')
    }
    throw err
  }

  await createNotification(db, claim.collector_id, {
    type: 'rating_received',
    message: `You received a ${data.rating}-star rating for "${claim.item_name}".`,
    link: '/collector/history'
  })

  res.status(201).json({ message: 'Rating submitted' })
}
