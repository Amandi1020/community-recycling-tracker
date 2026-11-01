import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import env from './config/env.js'
import logger from './utils/logger.js'
import ApiError from './utils/ApiError.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import residentRoutes from './routes/residentRoutes.js'
import collectorRoutes from './routes/collectorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import listingRoutes from './routes/listingRoutes.js'

const app = express()

if (env.IS_PRODUCTION) {
  app.set('trust proxy', 1)
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    return callback(new ApiError(403, 'Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

if (env.LOG_REQUESTS) {
  app.use((req, res, next) => {
    const startedAt = Date.now()
    res.on('finish', () => {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`)
    })
    next()
  })
}

app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '1d' }))

app.get('/', (req, res) => {
  res.json({ message: 'Recycling Tracker API is running!' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/resident', residentRoutes)
app.use('/api/collector', collectorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/listings', listingRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
