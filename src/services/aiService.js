import { schemas, validateResult } from './aiContracts'

export const AI_UNAVAILABLE = 'AI analysis is temporarily unavailable. Basic analysis is still available.'

async function request(path, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), body ? 65000 : 5000)
  try {
    const response = await fetch(`/api/${path}`, {
      method: body ? 'POST' : 'GET',
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(AI_UNAVAILABLE)
    const result = await response.json()
    if (body && !validateResult(result, schemas[path])) throw new Error(AI_UNAVAILABLE)
    return result
  } catch {
    throw new Error(AI_UNAVAILABLE)
  } finally {
    clearTimeout(timeout)
  }
}

export async function getAIStatus() {
  const status = await request('ai-status')
  if (typeof status.enabled !== 'boolean' || typeof status.configured !== 'boolean' || typeof status.model !== 'string') {
    throw new Error(AI_UNAVAILABLE)
  }
  return status
}
export const analyzeJD = (jd) => request('analyze-jd', { jd })
export const matchResume = (jd, resume) => request('match-resume', { jd, resume })
export const generateInterviewPrep = (jd, resume) => request('interview-prep', { jd, resume })
