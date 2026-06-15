import express from 'express'
import multer from 'multer'
import path from 'path'
import { getDashboard, getCategories, postListing } from '../controllers/residentController.js'
import verifyToken from '../middleware/auth.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})

const upload = multer({ storage })

const router = express.Router()

router.get('/dashboard', verifyToken, getDashboard)
router.get('/categories', verifyToken, getCategories)
router.post('/post', verifyToken, upload.single('photo'), postListing)

export default router