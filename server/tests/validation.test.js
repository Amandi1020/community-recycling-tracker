import test from 'node:test'
import assert from 'node:assert/strict'
import {
  requireEmail,
  requirePassword,
  requireId,
  parsePagination,
  validateRegister,
  validateListingInput
} from '../utils/validation.js'

test('requireEmail normalizes and validates addresses', () => {
  assert.equal(requireEmail('  USER@Example.COM '), 'user@example.com')
  assert.throws(() => requireEmail('not-an-email'), /valid email/)
})

test('requirePassword enforces 8-72 characters', () => {
  assert.equal(requirePassword('12345678'), '12345678')
  assert.throws(() => requirePassword('short'), /between 8 and 72/)
  assert.throws(() => requirePassword('x'.repeat(73)), /between 8 and 72/)
})

test('requireId rejects zero and negative values', () => {
  assert.equal(requireId('42'), 42)
  assert.throws(() => requireId(0), /positive integer/)
  assert.throws(() => requireId('-1'), /positive integer/)
})

test('parsePagination clamps page and limit', () => {
  assert.deepEqual(parsePagination({ page: '0', limit: '500' }), { page: 1, limit: 100, offset: 0 })
  assert.deepEqual(parsePagination({ page: '3', limit: '10' }), { page: 3, limit: 10, offset: 20 })
})

test('parsePagination applies defaults and rejects non-integer input', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, offset: 0 })
  assert.deepEqual(parsePagination({ page: 'abc', limit: 'xyz' }), { page: 1, limit: 20, offset: 0 })
  assert.deepEqual(parsePagination({ page: '-3', limit: '-10' }), { page: 1, limit: 1, offset: 0 })
  assert.deepEqual(parsePagination({ page: '2', limit: '500' }), { page: 2, limit: 100, offset: 100 })
  assert.deepEqual(parsePagination({ page: '2.5', limit: '10.5' }), { page: 1, limit: 20, offset: 0 })
})

test('validateRegister accepts resident input and rejects admin role', () => {
  const data = validateRegister({
    name: ' Test User ',
    email: 'TEST@example.com',
    password: 'password123',
    role: 'resident',
    district: 'Colombo'
  })
  assert.equal(data.name, 'Test User')
  assert.equal(data.email, 'test@example.com')
  assert.throws(
    () => validateRegister({ ...data, role: 'admin' }),
    /Role must be one of/
  )
})

test('validateListingInput rounds weight and parses remove_photo', () => {
  const data = validateListingInput({
    item_name: 'Bottles',
    category_id: '2',
    weight_kg: '1.234',
    address: 'Main Street',
    available_time: 'Evening',
    remove_photo: 'true'
  })
  assert.equal(data.category_id, 2)
  assert.equal(data.weight_kg, 1.23)
  assert.equal(data.remove_photo, true)
})
