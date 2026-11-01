import multer from 'multer'
import ApiError from '../utils/ApiError.js'
import env from '../config/env.js'
import logger from '../utils/logger.js'

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  let status = err.status || err.statusCode || 500
  let message = err.message || 'Internal server error'
  let code = err.code

  if (err instanceof multer.MulterError) {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Photo must be 5MB or smaller'
      : `Upload error: ${err.message}`
    code = err.code
  } else if (err.type === 'entity.too.large') {
    status = 413
    message = 'Request body is too large'
    code = 'PAYLOAD_TOO_LARGE'
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'Invalid JSON body'
    code = 'INVALID_JSON'
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409
    message = 'A record with these details already exists'
    code = 'DUPLICATE_ENTRY'
  } else if (!(err instanceof ApiError) && status >= 500) {
    message = 'Internal server error'
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, err)
  }

  const body = { message }
  if (code) body.code = code
  if (!env.IS_PRODUCTION && status >= 500 && err.stack) {
    body.stack = err.stack
  }

  res.status(status).json(body)
}
