import express from 'express'
import { getDashboard, getUsers, updateUserStatus, deleteUser, getCategories, updateCategory } from '../controllers/adminController.js'
import verifyToken from '../middleware/auth.js'

const router = express.Router()

router.get('/dashboard', verifyToken, getDashboard)
router.get('/users', verifyToken, getUsers)
router.put('/users/:userId/status', verifyToken, updateUserStatus)
router.delete('/users/:userId', verifyToken, deleteUser)
router.get('/categories', verifyToken, getCategories)
router.put('/categories/:categoryId', verifyToken, updateCategory)

export default router