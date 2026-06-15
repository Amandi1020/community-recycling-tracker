import express from 'express'
import { getDashboard } from '../controllers/residentController.js'
import verifyToken from '../middleware/auth.js'

const router = express.Router()

router.get('/dashboard', verifyToken, getDashboard)

export default router