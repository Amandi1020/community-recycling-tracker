import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import db from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import residentRoutes from './routes/residentRoutes.js'
import collectorRoutes from './routes/collectorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

db.getConnection()
  .then(() => console.log('MySQL connected successfully!'))
  .catch(err => console.error('MySQL connection error:', err))

app.use('/api/auth', authRoutes)
app.use('/api/resident', residentRoutes)
app.use('/api/collector', collectorRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Recycling Tracker API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})