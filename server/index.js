import app from './app.js'
import db from './config/db.js'
import env from './config/env.js'
import logger from './utils/logger.js'

let server

const shutdown = async signal => {
  logger.info(`${signal} received, shutting down`)
  const forceExit = setTimeout(() => process.exit(1), 10000)
  forceExit.unref()

  server?.close(async () => {
    try {
      await db.end()
    } catch (err) {
      logger.error('Failed to close database pool', err)
    }
    process.exit(0)
  })
}

const start = async () => {
  try {
    const connection = await db.getConnection()
    connection.release()
    logger.info('MySQL connected successfully')

    server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`)
    })
  } catch (err) {
    logger.error('Unable to connect to MySQL', err)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', err => logger.error('Unhandled rejection', err))
process.on('uncaughtException', err => {
  logger.error('Uncaught exception', err)
  shutdown('uncaughtException')
})

start()
