import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import status from '../api/ai-status.js'
import jd from '../api/analyze-jd.js'
import resume from '../api/match-resume.js'
import prep from '../api/interview-prep.js'
import { createAIHandler, readBody } from '../server/aiCore.js'

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value },
    writeHead(code, headers) { this.code = code; Object.assign(this.headers, headers) },
    end(body) { this.body = JSON.parse(body) } }
}

// All values below are dummy test configuration; no real credentials are loaded.
test('four serverless exports fail closed and never use network', async () => {
  const original = { ...process.env }
  const originalFetch = globalThis.fetch
  let requests = 0
  globalThis.fetch = () => { requests++; throw new Error('Network forbidden in tests') }
  try {
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENAI_MODEL
    delete process.env.AI_ENABLED
    let res = response()
    await status({ method: 'GET' }, res)
    assert.deepEqual(res.body, { enabled: false, configured: false, provider: 'openai', model: 'gpt-5.6-luna' })
    for (const enabled of [undefined, 'false', 'TRUE', '1', 'true']) {
      if (enabled === undefined) delete process.env.AI_ENABLED
      else process.env.AI_ENABLED = enabled
      for (const handler of [jd, resume, prep]) {
        res = response()
        await handler({ method: 'POST', get body() { throw new Error('Body must not be read') } }, res)
        assert.equal(res.code, 503)
        assert.equal(res.body.code, enabled === 'true' ? 'AI_NOT_CONFIGURED' : 'AI_DISABLED')
      }
    }
    process.env.AI_ENABLED = 'false'
    process.env.OPENAI_API_KEY = 'offline-test-placeholder'
    process.env.OPENAI_MODEL = 'test-model'
    res = response(); await status({ method: 'GET' }, res)
    assert.deepEqual(res.body, { enabled: false, configured: true, provider: 'openai', model: 'test-model' })
    for (const handler of [jd, resume, prep]) {
      res = response(); await handler({ method: 'POST', body: {} }, res); assert.equal(res.body.code, 'AI_DISABLED')
      res = response(); await handler({ method: 'GET' }, res); assert.equal(res.code, 405)
    }
    res = response(); await status({ method: 'POST' }, res); assert.equal(res.code, 405)
    assert.equal(requests, 0)
  } finally {
    globalThis.fetch = originalFetch
    for (const name of ['AI_ENABLED', 'OPENAI_API_KEY', 'OPENAI_MODEL']) {
      if (original[name] === undefined) delete process.env[name]
      else process.env[name] = original[name]
    }
  }
})

test('supports parsed Vercel JSON, strings, buffers and native streams', async () => {
  const body = { jd: '岗位 description', resume: 'Experience' }
  for (const value of [body, JSON.stringify(body), Buffer.from(JSON.stringify(body))]) {
    assert.deepEqual(await readBody({ body: value }), body)
  }
  const bytes = Buffer.from(JSON.stringify(body))
  assert.deepEqual(await readBody(Readable.from([bytes.subarray(0, 9), bytes.subarray(9)])), body)
  for (const value of [null, [], 'bad json', 'null']) await assert.rejects(readBody({ body: value }))
  await assert.rejects(readBody({ body: { jd: 'a'.repeat(200001) } }), { statusCode: 413 })
})

test('shared handler uses parsed input and safely handles provider or schema failure', async () => {
  const original = { ...process.env }
  process.env.AI_ENABLED = 'true'
  process.env.OPENAI_API_KEY = 'offline-test-placeholder'
  try {
    for (const task of ['analyze-jd', 'match-resume', 'interview-prep']) {
      const handler = createAIHandler(task, async (actualTask, body) => {
        assert.equal(actualTask, task)
        assert.equal(body.jd, 'JD')
        if (task !== 'analyze-jd') assert.equal(body.resume, 'Resume')
        throw new Error('Private provider failure')
      })
      let res = response()
      await handler({ method: 'POST', body: { jd: ' JD ', resume: ' Resume ' } }, res)
      assert.equal(res.code, 502)
      assert.ok(!JSON.stringify(res.body).includes('Private provider'))
      res = response(); await handler({ method: 'POST', body: {} }, res); assert.equal(res.code, 400)
      res = response()
      await createAIHandler(task, async () => ({}))({ method: 'POST', body: { jd: 'JD', resume: 'Resume' } }, res)
      assert.equal(res.code, 502)
    }
  } finally {
    for (const name of ['AI_ENABLED', 'OPENAI_API_KEY']) {
      if (original[name] === undefined) delete process.env[name]
      else process.env[name] = original[name]
    }
  }
})
