import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateJobStats } from '../src/services/jobStats.js'

const original = ['Interview', 'Applied', 'Screening', 'Applied'].map((status) => ({ status }))
const baseline = { applications: 4, screening: 2, interview: 1, finalRound: 0, offers: 0, interviewRate: 25 }

test('funnel follows add, status change, delete and rejection', () => {
  assert.deepEqual(calculateJobStats(original), baseline)
  assert.deepEqual(calculateJobStats([...original, { status: 'Offer' }]), {
    applications: 5, screening: 3, interview: 2, finalRound: 1, offers: 1, interviewRate: 40,
  })
  for (const status of ['Applied', 'Rejected']) {
    assert.deepEqual(calculateJobStats([...original, { status }]), {
      ...baseline, applications: 5, interviewRate: 20,
    })
  }
  assert.deepEqual(calculateJobStats(original), baseline)
})

test('each status contributes to the defined cumulative stages', () => {
  const expected = {
    Applied: [1, 0, 0, 0, 0, 0], Screening: [1, 1, 0, 0, 0, 0],
    Interview: [1, 1, 1, 0, 0, 100], 'Final Round': [1, 1, 1, 1, 0, 100],
    Offer: [1, 1, 1, 1, 1, 100], Rejected: [1, 0, 0, 0, 0, 0],
  }
  for (const [status, values] of Object.entries(expected)) {
    assert.deepEqual(Object.values(calculateJobStats([{ status }])), values)
  }
  assert.deepEqual(Object.values(calculateJobStats([])), [0, 0, 0, 0, 0, 0])
})
