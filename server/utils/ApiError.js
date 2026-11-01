export default class ApiError extends Error {
  constructor(status, message, code = undefined) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
