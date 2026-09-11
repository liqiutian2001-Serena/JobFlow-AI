import test from 'node:test'
import assert from 'node:assert/strict'
import { getAIConfig, createAIHandler } from '../server/aiCore.js'
import { schemas } from '../src/services/aiContracts.js'

const names = ['AI_ENABLED', 'AI_PROVIDER', 'AI_API_KEY', 'AI_MODEL', 'AI_BASE_URL', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_BASE_URL']
function response() {
  return { setHeader() {}, writeHead(code) { this.code = code }, end(body) { this.body = JSON.parse(body) } }
}
function example(schema) {
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties).map(([key, child]) => [key, example(child)]))
  if (schema.type === 'array') return []
  return schema.enum?.[0] ?? 'Insufficient evidence.'
}

test('provider configuration, protocols and failures with intercepted SDK transport only', async () => {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]))
  const originalFetch = globalThis.fetch
  let calls = 0
  let reply = {}
  let lastRequest
  globalThis.fetch = async (url, options) => {
    calls++
    lastRequest = { url: String(url), body: JSON.parse(options.body), headers: new Headers(options.headers) }
    return new Response(JSON.stringify(reply), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  try {
    for (const name of names) delete process.env[name]
    assert.deepEqual(getAIConfig(), { enabled: false, configured: false, provider: 'openai', model: 'gpt-5.6-luna' })
    process.env.OPENAI_API_KEY = 'legacy-dummy'
    process.env.OPENAI_MODEL = 'legacy-model'
    assert.equal(getAIConfig().configured, true)
    assert.equal(getAIConfig().model, 'legacy-model')
    process.env.AI_API_KEY = 'unified-dummy'
    process.env.AI_MODEL = 'unified-model'
    assert.equal(getAIConfig().model, 'unified-model')
    process.env.OPENAI_BASE_URL = 'https://ignored.invalid/v1'
    for (const provider of ['openai', 'deepseek']) {
      process.env.AI_PROVIDER = provider
      process.env.AI_BASE_URL = provider === 'deepseek' ? 'https://mock-provider.invalid/v1' : ''
      process.env.AI_ENABLED = 'false'
      const count = calls
      for (const task of Object.keys(schemas)) {
        const res = response()
        await createAIHandler(task)({ method: 'POST', body: { jd: 'JD', resume: 'Resume' } }, res)
        assert.equal(res.body.code, 'AI_DISABLED')
      }
      assert.equal(calls, count)
      // The SDK transport above is fully mocked; no enabled test can reach the network.
      process.env.AI_ENABLED = 'true'
      for (const task of Object.keys(schemas)) {
        const result = example(schemas[task])
        reply = provider === 'openai'
          ? { object: 'response', status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(result) }] }] }
          : { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(result) } }] }
        const res = response()
        await createAIHandler(task)({ method: 'POST', body: { jd: 'JD', resume: 'Resume' } }, res)
        assert.equal(res.code, 200)
        assert.deepEqual(res.body, result)
        assert.equal(lastRequest.body.model, 'unified-model')
        assert.equal(lastRequest.headers.get('authorization'), 'Bearer unified-dummy')
        if (provider === 'openai') {
          assert.equal(lastRequest.url, 'https://api.openai.com/v1/responses')
          assert.equal(lastRequest.body.text.format.type, 'json_schema')
        } else {
          assert.equal(lastRequest.url, 'https://mock-provider.invalid/v1/chat/completions')
          assert.equal(lastRequest.body.response_format.type, 'json_object')
          assert.match(lastRequest.body.messages[0].content, /JSON schema/)
        }
      }
      reply = provider === 'openai' ? { object: 'response', status: 'completed', output: [] } : { choices: [{ finish_reason: 'length', message: { content: '{}' } }] }
      const res = response()
      await createAIHandler('analyze-jd')({ method: 'POST', body: { jd: 'JD' } }, res)
      assert.equal(res.code, 502)
    }
    process.env.AI_BASE_URL = ''
    assert.equal(getAIConfig().configured, false) // DeepSeek never silently routes to OpenAI.
    process.env.AI_BASE_URL = 'https://mock-provider.invalid/v1'
    delete process.env.AI_MODEL; delete process.env.OPENAI_MODEL
    assert.equal(getAIConfig().model, '')
    assert.equal(getAIConfig().configured, false)
    process.env.AI_PROVIDER = 'unsupported'
    assert.equal(getAIConfig().configured, false)
    const res = response()
    await createAIHandler('ai-status')({ method: 'GET' }, res)
    assert.deepEqual(Object.keys(res.body).sort(), ['configured', 'enabled', 'model', 'provider'])
  } finally {
    globalThis.fetch = originalFetch
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name]
      else process.env[name] = saved[name]
    }
  }
})
