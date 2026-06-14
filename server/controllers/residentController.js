import db from '../config/db.js'

export const getDashboard = async (req, res) => {
  const userId = req.user.id

  try {
    // Get total stats
    const [statsRows] = await db.execute(`
      SELECT 
        u.points AS total_points,
        u.level,
        COALESCE(SUM(l.weight_kg), 0) AS total_kg,
        COALESCE(SUM(l.weight_kg * c.co2_per_kg), 0) AS co2_saved
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      LEFT JOIN claims cl ON cl.listing_id = l.id AND cl.status = 'collected'
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId])

    // Get monthly chart data
    const [chartRows] = await db.execute(`
      SELECT 
        DATE_FORMAT(cl.collected_at, '%b %Y') AS month,
        COALESCE(SUM(l.weight_kg), 0) AS kg
      FROM listings l
      JOIN claims cl ON cl.listing_id = l.id AND cl.status = 'collected'
      WHERE l.user_id = ?
      GROUP BY DATE_FORMAT(cl.collected_at, '%b %Y')
      ORDER BY MIN(cl.collected_at) ASC
      LIMIT 6
    `, [userId])

    // Get earned badges
    const [badgeRows] = await db.execute(`
      SELECT b.id, b.name, b.description, b.icon
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
    `, [userId])

    res.json({
      stats: statsRows[0],
      chartData: chartRows,
      badges: badgeRows
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}