export const logAudit = async (executor, actorId, action, entityType, entityId = null, details = null) => {
  await executor.execute(
    'INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [actorId, action, entityType, entityId, details ? JSON.stringify(details) : null]
  )
}
