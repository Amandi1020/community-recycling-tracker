import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Test DB connection
db.getConnection()
  .then(() => console.log('MySQL connected successfully!'))
  .catch(err => console.error('MySQL connection error:', err))

// Routes
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Recycling Tracker API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})