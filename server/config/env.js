import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET']
const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('JWT_SECRET is shorter than 32 characters. Use a long random value in production.')
}

const nodeEnv = process.env.NODE_ENV || 'development'
const clientOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const env = {
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: nodeEnv === 'production',
  PORT: Number(process.env.PORT || 5000),
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME,
  DB_SSL: process.env.DB_SSL === 'true',
  DB_SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGINS: clientOrigins,
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
  LOG_REQUESTS: process.env.LOG_REQUESTS !== 'false'
}

export default env
