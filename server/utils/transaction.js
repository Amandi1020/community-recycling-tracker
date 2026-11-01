import db from '../config/db.js'

const withTransaction = async handler => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const result = await handler(connection)
    await connection.commit()
    return result
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export default withTransaction
