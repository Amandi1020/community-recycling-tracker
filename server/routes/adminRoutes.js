import express from 'express'
import { getDashboard } from '../controllers/adminController.js'
import verifyToken from '../middleware/auth.js'
import isAdmin from '../middleware/isAdmin.js'

const router = express.Router()

router.get('/dashboard', verifyToken, isAdmin, getDashboard)

export default router