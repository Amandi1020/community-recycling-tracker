import db from '../config/db.js'

export const getDashboard = async (req, res) => {
  try {
    const [residents] = await db.execute(`SELECT COUNT(*) AS count FROM users WHERE role = 'resident'`)
    const [collectors] = await db.execute(`SELECT COUNT(*) AS count FROM users WHERE role = 'collector'`)
    const [listings] = await db.execute(`SELECT COUNT(*) AS count FROM listings`)
    const [totalKg] = await db.execute(`
      SELECT COALESCE(SUM(l.weight_kg), 0) AS total_kg
      FROM listings l JOIN claims cl ON cl.listing_id = l.id
      WHERE cl.status = 'collected'
    `)
    const [districtStats] = await db.execute(`
      SELECT u.district,
        COUNT(l.id) AS total_listings,
        COALESCE(SUM(CASE WHEN l.status = 'collected' THEN l.weight_kg ELSE 0 END), 0) AS total_kg
      FROM users u LEFT JOIN listings l ON l.user_id = u.id
      WHERE u.role = 'resident'
      GROUP BY u.district ORDER BY total_kg DESC
    `)
    const [categoryStats] = await db.execute(`
      SELECT c.name, COUNT(l.id) AS total_listings,
        COALESCE(SUM(l.weight_kg), 0) AS total_kg
      FROM categories c LEFT JOIN listings l ON l.category_id = c.id
      GROUP BY c.id
    `)
    const [monthlyStats] = await db.execute(`
      SELECT DATE_FORMAT(cl.collected_at, '%b %Y') AS month,
        COALESCE(SUM(l.weight_kg), 0) AS total_kg,
        COUNT(cl.id) AS total_collections
      FROM claims cl JOIN listings l ON cl.listing_id = l.id
      WHERE cl.status = 'collected'
      GROUP BY DATE_FORMAT(cl.collected_at, '%b %Y')
      ORDER BY MIN(cl.collected_at) ASC LIMIT 6
    `)
    const [pendingCollectors] = await db.execute(`
      SELECT COUNT(*) AS count FROM users WHERE role = 'collector' AND status = 'pending'
    `)

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
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, district, points, level, status, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateUserStatus = async (req, res) => {
  const { userId } = req.params
  const { status } = req.body
  try {
    await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId])
    res.json({ message: 'User status updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteUser = async (req, res) => {
  const { userId } = req.params
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [userId])
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params
  const { points_per_kg, co2_per_kg } = req.body
  try {
    await db.execute(
      'UPDATE categories SET points_per_kg = ?, co2_per_kg = ? WHERE id = ?',
      [points_per_kg, co2_per_kg, categoryId]
    )
    res.json({ message: 'Category updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}