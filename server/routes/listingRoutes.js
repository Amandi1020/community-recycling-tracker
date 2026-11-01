import express from 'express'
import { getListingPhoto } from '../controllers/listingController.js'

const router = express.Router()

router.get('/:listingId/photo', getListingPhoto)

export default router
