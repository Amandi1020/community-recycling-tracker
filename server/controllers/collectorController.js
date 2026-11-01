import db from '../config/db.js'
import ApiError from '../utils/ApiError.js'
import withTransaction from '../utils/transaction.js'
import { awardBadges, calculateCollectionAward, levelForPoints } from '../utils/gamification.js'
import { createNotification } from '../utils/notify.js'
import { parsePagination, parseSearch, requireId } from '../utils/validation.js'

export const getDashboard = async (req, res) => {
  const collectorId = req.user.id

  const [collections] = await db.execute(
    `SELECT COUNT(*) AS total_collections,
       COALESCE(SUM(COALESCE(cl.weight_kg, l.weight_kg)), 0) AS total_kg
     FROM claims cl
     JOIN listings l ON l.id = cl.listing_id
     WHERE cl.collector_id = ? AND cl.status = 'collected'`,
    [collectorId]
  )

  const [pending] = await db.execute(
    "SELECT COUNT(*) AS pending FROM claims WHERE collector_id = ? AND status = 'claimed'",
    [collectorId]
  )

  const [pendingList] = await db.execute(
    `SELECT cl.id AS claim_id, l.id, l.item_name, l.address, l.weight_kg, l.available_time, l.photo_url
     FROM claims cl
     JOIN listings l ON l.id = cl.listing_id
     WHERE cl.collector_id = ? AND cl.status = 'claimed'
     ORDER BY cl.claimed_at ASC`,
    [collectorId]
  )

  const [ratingRows] = await db.execute(
    'SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS rating_count FROM collector_ratings WHERE collector_id = ?',
    [collectorId]
  )

  res.json({
    stats: {
      total_collections: collections[0].total_collections,
      total_kg: collections[0].total_kg,
      pending: pending[0].pending,
      pendingList,
      average_rating: Number(ratingRows[0].average_rating) || 0,
      rating_count: ratingRows[0].rating_count
    }
  })
}

export const browseListings = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query)
  const search = parseSearch(req.query)
  const categoryId = req.query.categoryId ? requireId(req.query.categoryId, 'Category id') : null

  const filters = ["u.district = ?", "l.status = 'available'"]
  const params = [req.user.district]

  if (search) {
    filters.push('(l.item_name LIKE ? OR l.address LIKE ?)')
    const term = `%${search}%`
    params.push(term, term)
  }

  if (categoryId) {
    filters.push('l.category_id = ?')
    params.push(categoryId)
  }

  const where = filters.join(' AND ')

  const [rows] = await db.execute(
    `SELECT l.*, c.name AS category_name, u.name AS resident_name
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.user_id
     WHERE ${where}
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM listings l
     JOIN users u ON u.id = l.user_id
     WHERE ${where}`,
    params
  )

  const total = countRows[0].total
  res.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  })
}

export const claimListing = async (req, res) => {
  const listingId = requireId(req.params.listingId, 'Listing id')

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      `SELECT l.id, l.status, l.user_id, l.item_name, u.district AS resident_district
       FROM listings l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = ?
       FOR UPDATE`,
      [listingId]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Listing not found')
    }

    const listing = rows[0]
    if (listing.status !== 'available') {
      throw new ApiError(409, 'This item has already been claimed')
    }
    if (listing.resident_district !== req.user.district) {
      throw new ApiError(403, 'You can only claim items in your own district')
    }

    try {
      await connection.execute(
        'INSERT INTO claims (listing_id, collector_id) VALUES (?, ?)',
        [listingId, req.user.id]
      )
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'This item has already been claimed')
      }
      throw err
    }

    await connection.execute("UPDATE listings SET status = 'claimed' WHERE id = ?", [listingId])
    await createNotification(connection, listing.user_id, {
      type: 'listing_claimed',
      message: `Your item "${listing.item_name}" was claimed by a collector.`,
      link: '/resident/listings'
    })
  })

  res.json({ message: 'Item claimed successfully' })
}

export const unclaim = async (req, res) => {
  const claimId = requireId(req.params.claimId, 'Claim id')

  await withTransaction(async connection => {
    const [rows] = await connection.execute(
      `SELECT cl.id, cl.listing_id, cl.status, l.user_id, l.item_name
       FROM claims cl
       JOIN listings l ON l.id = cl.listing_id
       WHERE cl.id = ? AND cl.collector_id = ?
       FOR UPDATE`,
      [claimId, req.user.id]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Claim not found')
    }

    const claim = rows[0]
    if (claim.status !== 'claimed') {
      throw new ApiError(409, 'Only active claims can be released')
    }

    await connection.execute('DELETE FROM claims WHERE id = ?', [claimId])
    await connection.execute("UPDATE listings SET status = 'available' WHERE id = ?", [claim.listing_id])
    await createNotification(connection, claim.user_id, {
      type: 'listing_unclaimed',
      message: `The collector released "${claim.item_name}". It is available again.`,
      link: '/resident/listings'
    })
  })

  res.json({ message: 'Claim released' })
}

export const getHistory = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query)

  const [rows] = await db.execute(
    `SELECT
       cl.id AS claim_id, cl.status, cl.claimed_at, cl.collected_at,
       l.id AS listing_id, l.item_name, l.weight_kg, l.address, l.available_time, l.photo_url,
       c.name AS category_name, u.name AS resident_name,
       cr.rating, cr.comment AS rating_comment
     FROM claims cl
     JOIN listings l ON l.id = cl.listing_id
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.user_id
     LEFT JOIN collector_ratings cr ON cr.claim_id = cl.id
     WHERE cl.collector_id = ?
     ORDER BY cl.claimed_at DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset]
  )

  const [countRows] = await db.execute(
    'SELECT COUNT(*) AS total FROM claims WHERE collector_id = ?',
    [req.user.id]
  )

  const [summaryRows] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(status = 'collected'), 0) AS completed,
       COALESCE(SUM(CASE WHEN status = 'collected' THEN COALESCE(weight_kg, 0) ELSE 0 END), 0) AS kg_collected
     FROM claims WHERE collector_id = ?`,
    [req.user.id]
  )

  const total = countRows[0].total
  res.json({
    data: rows,
    summary: summaryRows[0],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  })
}

export const markCollected = async (req, res) => {
  const claimId = requireId(req.params.claimId, 'Claim id')

  const award = await withTransaction(async connection => {
    const [rows] = await connection.execute(
      `SELECT
         cl.id, cl.listing_id, cl.status AS claim_status,
         l.user_id, l.item_name, l.status AS listing_status, l.weight_kg,
         c.points_per_kg, c.co2_per_kg
       FROM claims cl
       JOIN listings l ON l.id = cl.listing_id
       JOIN categories c ON c.id = l.category_id
       WHERE cl.id = ? AND cl.collector_id = ?
       FOR UPDATE`,
      [claimId, req.user.id]
    )

    if (rows.length === 0) {
      throw new ApiError(404, 'Claim not found')
    }

    const claim = rows[0]
    if (claim.claim_status !== 'claimed') {
      throw new ApiError(409, 'This claim has already been completed')
    }
    if (claim.listing_status !== 'claimed') {
      throw new ApiError(409, 'This listing is not in a claimable state')
    }

    const { points, co2Saved } = calculateCollectionAward(
      claim.weight_kg,
      claim.points_per_kg,
      claim.co2_per_kg
    )

    await connection.execute(
      `UPDATE claims
       SET status = 'collected', collected_at = NOW(), weight_kg = ?, points_awarded = ?, co2_saved = ?
       WHERE id = ? AND status = 'claimed'`,
      [claim.weight_kg, points, co2Saved, claimId]
    )

    await connection.execute("UPDATE listings SET status = 'collected' WHERE id = ?", [claim.listing_id])

    await connection.execute('UPDATE users SET points = points + ? WHERE id = ?', [
      points,
      claim.user_id
    ])

    const [userRows] = await connection.execute('SELECT points FROM users WHERE id = ?', [claim.user_id])
    const level = levelForPoints(userRows[0].points)
    await connection.execute('UPDATE users SET level = ? WHERE id = ?', [level, claim.user_id])

    const badges = await awardBadges(connection, claim.user_id)

    await createNotification(connection, claim.user_id, {
      type: 'listing_collected',
      message: `Your item "${claim.item_name}" was collected. You earned ${points} points.`,
      link: '/resident/dashboard'
    })

    return { points, co2Saved, level, badges }
  })

  res.json({ message: 'Marked as collected. Resident points updated.', award })
}
