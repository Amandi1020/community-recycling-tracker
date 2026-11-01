export const LEVEL_THRESHOLDS = [
  { name: 'Eco Hero', min: 500 },
  { name: 'Guardian', min: 200 },
  { name: 'Sprout', min: 50 },
  { name: 'Seedling', min: 0 }
]

export const levelForPoints = points => {
  const safePoints = Number(points) || 0
  return LEVEL_THRESHOLDS.find(level => safePoints >= level.min)?.name || 'Seedling'
}

export const calculateCollectionAward = (weightKg, pointsPerKg, co2PerKg) => {
  const weight = Number(weightKg) || 0
  return {
    points: Math.round(weight * (Number(pointsPerKg) || 0)),
    co2Saved: Math.round(weight * (Number(co2PerKg) || 0) * 1000) / 1000
  }
}

const metricQueries = {
  listings_count: {
    sql: 'SELECT COUNT(*) AS value FROM listings WHERE user_id = ? AND status <> ?',
    params: userId => [userId, 'cancelled']
  },
  ewaste_count: {
    sql: `
      SELECT COUNT(*) AS value
      FROM claims cl
      JOIN listings l ON l.id = cl.listing_id
      JOIN categories c ON c.id = l.category_id
      WHERE l.user_id = ? AND cl.status = 'collected' AND c.name = 'E-Waste'
    `,
    params: userId => [userId]
  },
  total_kg: {
    sql: `
      SELECT COALESCE(SUM(COALESCE(cl.weight_kg, l.weight_kg)), 0) AS value
      FROM claims cl
      JOIN listings l ON l.id = cl.listing_id
      WHERE l.user_id = ? AND cl.status = 'collected'
    `,
    params: userId => [userId]
  },
  points: {
    sql: 'SELECT points AS value FROM users WHERE id = ?',
    params: userId => [userId]
  }
}

export const awardBadges = async (connection, userId) => {
  const [badges] = await connection.execute('SELECT * FROM badges')
  if (badges.length === 0) return []

  const metrics = {}
  for (const [type, query] of Object.entries(metricQueries)) {
    const [rows] = await connection.execute(query.sql, query.params(userId))
    metrics[type] = Number(rows[0]?.value) || 0
  }

  const awarded = []
  for (const badge of badges) {
    const current = metrics[badge.condition_type]
    if (current !== undefined && current >= badge.condition_value) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      )
      if (result.affectedRows > 0) {
        awarded.push({ id: badge.id, name: badge.name })
      }
    }
  }
  return awarded
}
