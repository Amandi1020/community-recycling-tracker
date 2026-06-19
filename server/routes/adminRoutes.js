import express from 'express'
import { getDashboard, getUsers } from '../controllers/adminController.js'
import verifyToken from '../middleware/auth.js'

const router = express.Router()

router.get('/dashboard', verifyToken, getDashboard)
router.get('/users', verifyToken, getUsers)

export default router