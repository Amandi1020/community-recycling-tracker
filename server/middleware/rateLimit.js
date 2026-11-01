import rateLimit from 'express-rate-limit'
import ApiError from '../utils/ApiError.js'

const reject = message => (req, res, next) => next(new ApiError(429, message))

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: reject('Too many requests. Please slow down and try again later.')
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: reject('Too many login attempts. Please try again in 15 minutes.')
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: reject('Too many registration attempts. Please try again later.')
})

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: reject('Too many password reset requests. Please try again later.')
})
