import test from 'node:test'
import assert from 'node:assert/strict'
import { levelForPoints, calculateCollectionAward } from '../utils/gamification.js'

test('levelForPoints returns the correct threshold', () => {
  assert.equal(levelForPoints(0), 'Seedling')
  assert.equal(levelForPoints(49), 'Seedling')
  assert.equal(levelForPoints(50), 'Sprout')
  assert.equal(levelForPoints(199), 'Sprout')
  assert.equal(levelForPoints(200), 'Guardian')
  assert.equal(levelForPoints(499), 'Guardian')
  assert.equal(levelForPoints(500), 'Eco Hero')
})

test('calculateCollectionAward rounds points and co2 consistently', () => {
  assert.deepEqual(calculateCollectionAward(2.5, 10, 1.234), {
    points: 25,
    co2Saved: 3.085
  })
})

test('calculateCollectionAward handles invalid input safely', () => {
  assert.deepEqual(calculateCollectionAward('bad', null, undefined), {
    points: 0,
    co2Saved: 0
  })
})
