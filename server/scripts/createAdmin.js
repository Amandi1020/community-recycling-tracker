import bcrypt from 'bcryptjs'
import db from '../config/db.js'

const [name, email, password, district = 'Colombo'] = process.argv.slice(2)

if (!name || !email || !password) {
  console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com "strong-password" [district]')
  process.exit(1)
}

if (password.length < 8 || password.length > 72) {
  console.error('Password must be between 8 and 72 characters.')
  process.exit(1)
}

try {
  const passwordHash = await bcrypt.hash(password, 10)
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password_hash, role, district, status)
     VALUES (?, ?, ?, 'admin', ?, 'active')`,
    [name.trim(), email.trim().toLowerCase(), passwordHash, district.trim()]
  )
  console.log(`Admin created: ${email} (id ${result.insertId})`)
} catch (err) {
  if (err.code === 'ER_DUP_ENTRY') {
    console.error('A user with that email already exists.')
  } else {
    console.error('Failed to create admin:', err.message)
  }
  process.exitCode = 1
} finally {
  await db.end()
}
