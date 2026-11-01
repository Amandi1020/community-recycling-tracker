export const createNotification = async (executor, userId, { type, message, link = null }) => {
  await executor.execute(
    'INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)',
    [userId, type, message, link]
  )
}

export const notifyAdmins = async (executor, notification) => {
  const [admins] = await executor.execute(
    "SELECT id FROM users WHERE role = 'admin' AND status = 'active'"
  )
  for (const admin of admins) {
    await createNotification(executor, admin.id, notification)
  }
}
