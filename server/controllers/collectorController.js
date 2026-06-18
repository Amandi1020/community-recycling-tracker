import db from '../config/db.js'

export const getDashboard = async (req, res) => {
  const collectorId = req.user.id

  try {
    const [collections] = await db.execute(`
      SELECT COUNT(*) AS total_collections,
      COALESCE(SUM(l.weight_kg), 0) AS total_kg
      FROM claims cl
      JOIN listings l ON cl.listing_id = l.id
      WHERE cl.collector_id = ? AND cl.status = 'collected'
    `, [collectorId])

    const [pending] = await db.execute(`
      SELECT COUNT(*) AS pending FROM claims
      WHERE collector_id = ? AND status = 'claimed'
    `, [collectorId])

    const [pendingList] = await db.execute(`
      SELECT l.id, l.item_name, l.address, l.weight_kg, l.available_time
      FROM claims cl
      JOIN listings l ON cl.listing_id = l.id
      WHERE cl.collector_id = ? AND cl.status = 'claimed'
    `, [collectorId])

    res.json({
      stats: {
        total_collections: collections[0].total_collections,
        total_kg: collections[0].total_kg,
        pending: pending[0].pending,
        pendingList
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const browseListings = async (req, res) => {
  const district = req.user.district

  try {
    const [rows] = await db.execute(`
      SELECT l.*, c.name AS category_name, u.name AS resident_name
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      JOIN users u ON l.user_id = u.id
      WHERE u.district = ? AND l.status = 'available'
      ORDER BY l.created_at DESC
    `, [district])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const claimListing = async (req, res) => {
  const collectorId = req.user.id
  const { listingId } = req.params

  try {
    await db.execute(
      'INSERT INTO claims (listing_id, collector_id) VALUES (?, ?)',
      [listingId, collectorId]
    )

    await db.execute(
      'UPDATE listings SET status = ? WHERE id = ?',
      ['claimed', listingId]
    )

    res.json({ message: 'Item claimed successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getHistory = async (req, res) => {
  const collectorId = req.user.id

  try {
    const [rows] = await db.execute(`
      SELECT cl.id AS claim_id, cl.status, cl.claimed_at, cl.collected_at,
        l.item_name, l.weight_kg, l.address, l.available_time,
        c.name AS category_name, u.name AS resident_name
      FROM claims cl
      JOIN listings l ON cl.listing_id = l.id
      JOIN categories c ON l.category_id = c.id
      JOIN users u ON l.user_id = u.id
      WHERE cl.collector_id = ?
      ORDER BY cl.claimed_at DESC
    `, [collectorId])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const markCollected = async (req, res) => {
  const collectorId = req.user.id
  const { claimId } = req.params

  try {
    const [claim] = await db.execute(
      'SELECT * FROM claims WHERE id = ? AND collector_id = ?',
      [claimId, collectorId]
    )

    if (claim.length === 0) {
      return res.status(404).json({ message: 'Claim not found' })
    }

    await db.execute(
      'UPDATE claims SET status = ?, collected_at = NOW() WHERE id = ?',
      ['collected', claimId]
    )

    await db.execute(
      'UPDATE listings SET status = ? WHERE id = ?',
      ['collected', claim[0].listing_id]
    )

    // Award points to resident
    const [listing] = await db.execute(
      'SELECT l.*, c.points_per_kg FROM listings l JOIN categories c ON l.category_id = c.id WHERE l.id = ?',
      [claim[0].listing_id]
    )

    const points = Math.round(listing[0].weight_kg * listing[0].points_per_kg)

    await db.execute(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [points, listing[0].user_id]
    )

    // Update level
    const [user] = await db.execute('SELECT points FROM users WHERE id = ?', [listing[0].user_id])
    const totalPoints = user[0].points
    let level = 'Seedling'
    if (totalPoints >= 500) level = 'Eco Hero'
    else if (totalPoints >= 200) level = 'Guardian'
    else if (totalPoints >= 50) level = 'Sprout'

    await db.execute('UPDATE users SET level = ? WHERE id = ?', [level, listing[0].user_id])

    res.json({ message: 'Marked as collected! Resident points updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}