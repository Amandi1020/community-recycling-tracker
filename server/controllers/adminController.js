import db from '../config/db.js'

export const getDashboard = async (req, res) => {
  try {
    const [residents] = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'resident'"
    )
    const [collectors] = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'collector'"
    )
    const [listings] = await db.execute(
      'SELECT COUNT(*) AS count FROM listings'
    )
    const [kg] = await db.execute(`
      SELECT COALESCE(SUM(l.weight_kg), 0) AS total_kg
      FROM listings l
      JOIN claims cl ON cl.listing_id = l.id AND cl.status = 'collected'
    `)
    const [districtStats] = await db.execute(`
      SELECT u.district,
        COUNT(l.id) AS total_listings,
        COALESCE(SUM(CASE WHEN cl.status = 'collected' THEN l.weight_kg ELSE 0 END), 0) AS total_kg
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      LEFT JOIN claims cl ON cl.listing_id = l.id
      WHERE u.role = 'resident'
      GROUP BY u.district
      ORDER BY total_kg DESC
    `)

    res.json({
      total_residents: residents[0].count,
      total_collectors: collectors[0].count,
      total_listings: listings[0].count,
      total_kg: kg[0].total_kg,
      districtStats
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}