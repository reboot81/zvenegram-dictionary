import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeWord, structuralReason } from '../src/lib.mjs'
import { classifyWord, scoreWord } from '../src/score.mjs'

test('normalizes Swedish words', () => {
  assert.equal(normalizeWord('  ÄPPLE  '), 'äpple')
})

test('enforces the supported length range', () => {
  assert.equal(structuralReason('sol'), 'shorter-than-4')
  assert.equal(structuralReason('tolvbokstävr'), null)
  assert.equal(structuralReason('trettonbokstäv'), 'longer-than-12')
})

test('approves familiar words and reviews missing frequencies', () => {
  const frequency = { rank: 10_000, count: 500 }
  const score = scoreWord('äpple', frequency)
  assert.equal(classifyWord({ frequency, score, flagged: false, manuallyIncluded: false }).status, 'approved')
  assert.equal(classifyWord({ frequency: null, score: 25, flagged: false, manuallyIncluded: false }).status, 'review')
})

test('manual inclusion does not bypass structural checks handled upstream', () => {
  assert.deepEqual(
    classifyWord({ frequency: null, score: 0, flagged: false, manuallyIncluded: true }),
    { status: 'approved', reason: 'manual-inclusion' },
  )
})
