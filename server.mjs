import { createServer } from 'node:http'
import OpenAI from 'openai'

const PORT = 8787
const MAX_BODY_SIZE = 200_000

const analysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    coreResponsibilities: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5,
    },
    hardSkills: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 10,
    },
    softSkills: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 8,
    },
    keywords: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 10,
    },
    niceToHave: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 6,
    },
    interviewFocus: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5,
    },
    jdFocus: {
      type: 'object',
      additionalProperties: false,
      properties: {
        product: { type: 'string', enum: ['High', 'Medium', 'Low'] },
        data: { type: 'string', enum: ['High', 'Medium', 'Low'] },
        ai: { type: 'string', enum: ['High', 'Medium', 'Low'] },
        growth: { type: 'string', enum: ['High', 'Medium', 'Low'] },
      },
      required: ['product', 'data', 'ai', 'growth'],
    },
  },
  required: [
    'coreResponsibilities',
    'hardSkills',
    'softSkills',
    'keywords',
    'niceToHave',
    'interviewFocus',
    'jdFocus',
  ],
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(data))
}

async function readJsonBody(request) {
  let body = ''

  for await (const chunk of request) {
    body += chunk

    if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
  }

  try {
    return JSON.parse(body || '{}')
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

function normalizeStringList(value, maxItems) {
  if (!Array.isArray(value)) {
    throw new Error('Invalid AI response.')
  }

  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .slice(0, maxItems)
}

function normalizeAnalysis(value) {
  const levels = new Set(['High', 'Medium', 'Low'])

  if (!value || typeof value !== 'object' || !value.jdFocus) {
    throw new Error('Invalid AI response.')
  }

  const jdFocus = ['product', 'data', 'ai', 'growth'].reduce((result, key) => {
    const level = value.jdFocus[key]

    if (!levels.has(level)) {
      throw new Error('Invalid AI response.')
    }

    result[key] = level
    return result
  }, {})

  return {
    coreResponsibilities: normalizeStringList(value.coreResponsibilities, 5),
    hardSkills: normalizeStringList(value.hardSkills, 10),
    softSkills: normalizeStringList(value.softSkills, 8),
    keywords: normalizeStringList(value.keywords, 10),
    niceToHave: normalizeStringList(value.niceToHave, 6),
    interviewFocus: normalizeStringList(value.interviewFocus, 5),
    jdFocus,
  }
}

function sanitizeLogValue(value) {
  let safeValue = value == null ? 'not available' : String(value)
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    safeValue = safeValue.split(apiKey).join('[REDACTED]')
  }

  return safeValue
    .replace(/\bsk-[a-z0-9_-]{10,}\b/gi, '[REDACTED]')
    .replace(/\bbearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]')
    .replace(
      /\bauthorization\s*[:=]\s*[^\s,;]+/gi,
      'Authorization: [REDACTED]',
    )
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 2000)
}

function logOpenAIError(error) {
  const sdkError = error && typeof error === 'object' ? error : {}
  const nestedError =
    sdkError.error && typeof sdkError.error === 'object'
      ? sdkError.error
      : {}
  const responseError =
    sdkError.response?.data?.error &&
    typeof sdkError.response.data.error === 'object'
      ? sdkError.response.data.error
      : {}

  const details = {
    name: sdkError.name ?? sdkError.constructor?.name,
    status: sdkError.status ?? sdkError.statusCode ?? sdkError.response?.status,
    code: sdkError.code ?? nestedError.code ?? responseError.code,
    type: sdkError.type ?? nestedError.type ?? responseError.type,
    message:
      sdkError.message ?? nestedError.message ?? responseError.message ?? error,
  }

  console.error('OpenAI API request failed:')
  console.error(`  name: ${sanitizeLogValue(details.name)}`)
  console.error(`  status: ${sanitizeLogValue(details.status)}`)
  console.error(`  code: ${sanitizeLogValue(details.code)}`)
  console.error(`  type: ${sanitizeLogValue(details.type)}`)
  console.error(`  message: ${sanitizeLogValue(details.message)}`)
}

async function analyzeJobDescription(jd) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.responses.create({
    model: 'gpt-5.6-luna',
    store: false,
    instructions: `You are a recruiting analysis assistant. Analyze only the Job Description supplied by the user. Do not invent company information, salary, responsibilities, skills, or requirements that are not present in the Job Description. Keep every list concise, respect the requested maximum list sizes, and return the analysis in English using the provided JSON schema. Rate each JD focus area as High, Medium, or Low based only on evidence in the Job Description.`,
    input: `Job Description:\n\n${jd}`,
    text: {
      format: {
        type: 'json_schema',
        name: 'job_description_analysis',
        strict: true,
        schema: analysisSchema,
      },
    },
  })

  if (!response.output_text) {
    throw new Error('Empty AI response.')
  }

  return normalizeAnalysis(JSON.parse(response.output_text))
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/status') {
    sendJson(response, 200, { configured: Boolean(process.env.OPENAI_API_KEY) })
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/analyze-jd') {
    sendJson(response, 404, { error: 'Not found.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const jd = typeof body.jd === 'string' ? body.jd.trim() : ''

    if (!jd) {
      sendJson(response, 400, { error: 'Please paste a job description first.' })
      return
    }

    if (!process.env.OPENAI_API_KEY) {
      sendJson(response, 503, {
        code: 'AI_NOT_CONFIGURED',
        error: 'AI service is not configured yet.',
      })
      return
    }

    const analysis = await analyzeJobDescription(jd)
    sendJson(response, 200, analysis)
  } catch (error) {
    if (error.statusCode) {
      sendJson(response, error.statusCode, { error: error.message })
      return
    }

    logOpenAIError(error)

    if (error instanceof SyntaxError || error.message === 'Invalid AI response.' || error.message === 'Empty AI response.') {
      sendJson(response, 502, {
        code: 'AI_RESPONSE_INVALID',
        error: 'AI returned an unexpected result.',
      })
      return
    }

    sendJson(response, 502, { error: 'AI analysis failed. Please try again.' })
  }
})

server.listen(PORT, () => {
  const status = process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  console.log(`JobFlow AI server is running on http://localhost:${PORT} (AI ${status}).`)
})
