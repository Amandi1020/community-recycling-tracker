import express from 'express'
import {
  getDashboard,
  getUsers,
  updateUserStatus,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAuditLogs
} from '../controllers/adminController.js'
import verifyToken, { requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(verifyToken, requireRole('admin'))

router.get('/dashboard', getDashboard)
router.get('/users', getUsers)
router.put('/users/:userId/status', updateUserStatus)
router.delete('/users/:userId', deleteUser)
router.get('/categories', getCategories)
router.post('/categories', createCategory)
router.put('/categories/:categoryId', updateCategory)
router.delete('/categories/:categoryId', deleteCategory)
router.get('/audit-logs', getAuditLogs)

export default router
