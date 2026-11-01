import express from 'express'
import {
  getDashboard,
  browseListings,
  claimListing,
  unclaim,
  getHistory,
  markCollected
} from '../controllers/collectorController.js'
import verifyToken, { requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(verifyToken, requireRole('collector'))

router.get('/dashboard', getDashboard)
router.get('/browse', browseListings)
router.post('/claim/:listingId', claimListing)
router.delete('/claim/:claimId', unclaim)
router.get('/history', getHistory)
router.put('/collect/:claimId', markCollected)

export default router
