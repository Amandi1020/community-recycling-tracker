import ApiError from './ApiError.js'

export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
]

export const PUBLIC_ROLES = ['resident', 'collector']
export const USER_STATUSES = ['active', 'pending', 'inactive']
export const LISTING_STATUSES = ['available', 'claimed', 'collected', 'cancelled']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const trimmed = value => (typeof value === 'string' ? value.trim() : value)

export const requireString = (value, field, { min = 1, max = 255 } = {}) => {
  const text = trimmed(value)
  if (typeof text !== 'string' || text.length < min || text.length > max) {
    throw new ApiError(400, `${field} must be between ${min} and ${max} characters`)
  }
  return text
}

export const requireEmail = value => {
  const email = trimmed(value)?.toLowerCase()
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || email.length > 100) {
    throw new ApiError(400, 'A valid email address is required')
  }
  return email
}

export const requirePassword = (value, field = 'Password') => {
  if (typeof value !== 'string' || value.length < 8 || value.length > 72) {
    throw new ApiError(400, `${field} must be between 8 and 72 characters`)
  }
  return value
}

export const requireNumber = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new ApiError(400, `${field} must be a number between ${min} and ${max}`)
  }
  return number
}

export const requireInt = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const number = requireNumber(value, field, { min, max })
  if (!Number.isInteger(number)) {
    throw new ApiError(400, `${field} must be a whole number`)
  }
  return number
}

export const requireEnum = (value, field, allowed) => {
  if (!allowed.includes(value)) {
    throw new ApiError(400, `${field} must be one of: ${allowed.join(', ')}`)
  }
  return value
}

export const requireId = (value, field = 'id') => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new ApiError(400, `${field} must be a positive integer`)
  }
  return number
}

const parseInteger = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  const number = Number(value)
  return Number.isInteger(number) ? number : fallback
}

export const parsePagination = query => {
  const page = Math.max(1, parseInteger(query.page, 1))
  const limit = Math.min(100, Math.max(1, parseInteger(query.limit, 20)))
  return { page, limit, offset: (page - 1) * limit }
}

export const parseSearch = query => {
  const search = trimmed(query.search) || ''
  if (search.length > 100) {
    throw new ApiError(400, 'Search term is too long')
  }
  return search
}

export const validateRegister = body => {
  const role = requireEnum(body.role, 'Role', PUBLIC_ROLES)
  return {
    name: requireString(body.name, 'Name', { min: 2, max: 100 }),
    email: requireEmail(body.email),
    password: requirePassword(body.password),
    role,
    district: requireEnum(body.district, 'District', DISTRICTS)
  }
}

export const validateLogin = body => ({
  email: requireEmail(body.email),
  password: requireString(body.password, 'Password', { min: 1, max: 72 })
})

export const validateProfile = body => ({
  name: requireString(body.name, 'Name', { min: 2, max: 100 }),
  district: requireEnum(body.district, 'District', DISTRICTS)
})

export const validateChangePassword = body => ({
  currentPassword: requireString(body.currentPassword, 'Current password', { min: 1, max: 72 }),
  newPassword: requirePassword(body.newPassword, 'New password')
})

export const validateForgotPassword = body => ({
  email: requireEmail(body.email)
})

export const validateResetPassword = body => ({
  token: requireString(body.token, 'Reset token', { min: 20, max: 200 }),
  password: requirePassword(body.password, 'New password')
})

export const validateListingInput = (body, { partial = false } = {}) => {
  const result = {}
  const has = key => Object.prototype.hasOwnProperty.call(body, key)

  if (!partial || has('item_name')) {
    result.item_name = requireString(body.item_name, 'Item name', { min: 1, max: 100 })
  }
  if (!partial || has('category_id')) {
    result.category_id = requireId(body.category_id, 'Category')
  }
  if (!partial || has('weight_kg')) {
    const weight = requireNumber(body.weight_kg, 'Weight', { min: 0.01, max: 10000 })
    result.weight_kg = Math.round(weight * 100) / 100
  }
  if (!partial || has('address')) {
    result.address = requireString(body.address, 'Address', { min: 1, max: 255 })
  }
  if (!partial || has('available_time')) {
    result.available_time = requireString(body.available_time, 'Available time', { min: 1, max: 100 })
  }
  if (has('remove_photo')) {
    result.remove_photo = body.remove_photo === true || body.remove_photo === 'true'
  }
  return result
}

export const validateCategoryInput = (body, { partial = false } = {}) => {
  const result = {}
  const has = key => Object.prototype.hasOwnProperty.call(body, key)

  if (!partial || has('name')) {
    result.name = requireString(body.name, 'Category name', { min: 2, max: 100 })
  }
  if (!partial || has('points_per_kg')) {
    result.points_per_kg = requireInt(body.points_per_kg, 'Points per kg', { min: 0, max: 100000 })
  }
  if (!partial || has('co2_per_kg')) {
    result.co2_per_kg = requireNumber(body.co2_per_kg, 'CO2 per kg', { min: 0, max: 1000 })
  }
  return result
}

export const validateStatus = value => requireEnum(value, 'Status', USER_STATUSES)

export const validateRating = body => ({
  rating: requireInt(body.rating, 'Rating', { min: 1, max: 5 }),
  comment: body.comment === undefined || body.comment === null
    ? null
    : requireString(body.comment, 'Comment', { min: 1, max: 500 })
})
