import test from 'node:test'
import assert from 'node:assert/strict'
import { generatePuzzles, validatePuzzle } from '../src/generator.mjs'

const words = ['sommar', 'stenar', 'maten', 'saker', 'resan', 'tomten', 'mossa', 'rasten', 'ramen', 'moran', 'tornet', 'sorten', 'ostron', 'monster'].map((word, index) => ({ word, score: 100 - index }))

test('generates deterministic valid puzzles', () => {
  const options = { count: 1, seed: 'test', attempts: 3000 }
  const first = generatePuzzles(words, options)
  assert.deepEqual(first, generatePuzzles(words, options))
  assert.equal(validatePuzzle(first[0]), true)
})
