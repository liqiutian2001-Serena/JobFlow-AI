import test from 'node:test'
import assert from 'node:assert/strict'
import { createAIServer, getAIConfig } from '../server.mjs'
import { basicJD, basicResume, basicInterview } from '../src/services/basicResults.js'
import { SAMPLE_JD, RESUME_MATCH_SAMPLE_RESUME } from '../src/services/basicAnalysis.js'

 test('disabled status and all endpoints never invoke the AI provider', async () => {
  process.env.AI_ENABLED = 'false'
  let calls = 0
  const server = createAIServer(() => { calls++; throw new Error('Provider must not run') })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = 'http://127.0.0.1:' + server.address().port
  try {
    const status = await (await fetch(base + '/api/ai-status')).json()
    assert.deepEqual(status, getAIConfig())
    assert.equal(status.enabled, false)
    assert.deepEqual(Object.keys(status).sort(), ['configured', 'enabled', 'model', 'provider'])
    for (const task of ['analyze-jd', 'match-resume', 'interview-prep']) {
      const response = await fetch(base + '/api/' + task, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({jd:SAMPLE_JD,resume:RESUME_MATCH_SAMPLE_RESUME})})
      assert.equal(response.status, 503)
      assert.equal((await response.json()).code, 'AI_DISABLED')
    }
    assert.equal(calls, 0)
  } finally { await new Promise((resolve) => server.close(resolve)) }
})

test('all Basic analyses work with sample inputs and sparse evidence', () => {
  assert.ok(basicJD(SAMPLE_JD).hardSkills.length)
  assert.ok(basicResume(SAMPLE_JD, RESUME_MATCH_SAMPLE_RESUME).matchedSkills.length)
  assert.ok(basicInterview(SAMPLE_JD, RESUME_MATCH_SAMPLE_RESUME).resumeQuestions.length)
  assert.equal(basicResume('Unknown requirement', 'Unrelated text').matchLevel, 'Low')
  const missing = basicResume('SQL', 'User Research')
  assert.ok(missing.missingSkills.includes('SQL'))
  assert.ok(!missing.keywordsToEmphasize.includes('SQL'))
})

test('Interview Basic responds to all ten required topics in either input', () => {
  for (const topic of ['Product Management','Data Analysis','User Research','Growth','AI','SQL','Cross-functional Collaboration','Product Metrics','E-commerce','Operations']) {
    for (const inputs of [[topic, 'Other experience'], ['Other role',topic]]) {
      const result = basicInterview(...inputs)
      assert.ok(result.highProbabilityQuestions.length, topic)
      assert.ok(result.highProbabilityQuestions.length <= 8)
    }
  }
})
