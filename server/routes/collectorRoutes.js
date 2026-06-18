import express from 'express'
import { getDashboard, browseListings, claimListing, getHistory, markCollected } from '../controllers/collectorController.js'
import verifyToken from '../middleware/auth.js'

const router = express.Router()

router.get('/dashboard', verifyToken, getDashboard)
router.get('/browse', verifyToken, browseListings)
router.post('/claim/:listingId', verifyToken, claimListing)
router.get('/history', verifyToken, getHistory)
router.put('/collect/:claimId', verifyToken, markCollected)

export default router