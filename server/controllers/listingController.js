import db from '../config/db.js'
import ApiError from '../utils/ApiError.js'
import { requireId } from '../utils/validation.js'

export const getListingPhoto = async (req, res) => {
  const listingId = requireId(req.params.listingId, 'Listing id')

  const [rows] = await db.execute(
    'SELECT mime_type, data FROM listing_photos WHERE listing_id = ?',
    [listingId]
  )

  if (rows.length === 0) {
    throw new ApiError(404, 'Photo not found')
  }

  res.set('Content-Type', rows[0].mime_type)
  res.set('Cache-Control', 'public, max-age=86400, immutable')
  res.send(rows[0].data)
}
