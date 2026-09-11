import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { createAIHandler, sendJson } from './server/aiCore.js'
export { getAIConfig } from './server/aiCore.js'

export function createAIServer(runAI) {
  const handlers = Object.fromEntries(
    ['ai-status', 'analyze-jd', 'match-resume', 'interview-prep'].map((task) =>
      ['/api/' + task, createAIHandler(task, runAI)],
    ),
  )
  handlers['/api/status'] = handlers['/api/ai-status']
  return createServer((request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname
    const handler = handlers[path]
    if (handler) return handler(request, response)
    sendJson(response, 404, { error: 'Not found.' })
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createAIServer().listen(8787, '127.0.0.1', () => {
    console.log('JobFlow AI server is running on http://127.0.0.1:8787')
  })
}
