import express from 'express'
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'
import verifyToken from '../middleware/auth.js'
import { forgotPasswordLimiter, loginLimiter, registerLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.get('/me', verifyToken, me)
router.put('/profile', verifyToken, updateProfile)
router.put('/password', verifyToken, changePassword)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', resetPassword)

export default router
