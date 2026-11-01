import express from 'express'
import multer from 'multer'
import {
  getDashboard,
  getCategories,
  postListing,
  getMyListings,
  getListing,
  updateListing,
  cancelListing,
  getLeaderboard,
  rateCollector
} from '../controllers/residentController.js'
import verifyToken, { requireRole } from '../middleware/auth.js'
import ApiError from '../utils/ApiError.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new ApiError(400, 'Only image files are allowed'))
    }
    return callback(null, true)
  }
})

const router = express.Router()

router.use(verifyToken, requireRole('resident'))

router.get('/dashboard', getDashboard)
router.get('/categories', getCategories)
router.post('/post', upload.single('photo'), postListing)
router.get('/listings', getMyListings)
router.get('/listings/:id', getListing)
router.put('/listings/:id', upload.single('photo'), updateListing)
router.delete('/listings/:id', cancelListing)
router.get('/leaderboard', getLeaderboard)
router.post('/claims/:claimId/rating', rateCollector)

export default router
