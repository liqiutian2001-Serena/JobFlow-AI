// Shared response shapes keep the server and browser in agreement. No secrets here.
const list = (maxItems) => ({ type: 'array', items: { type: 'string' }, maxItems })
const level = { type: 'string', enum: ['Low', 'Medium', 'High'] }
const object = (properties) => ({
  type: 'object', additionalProperties: false, properties,
  required: Object.keys(properties),
})

export const schemas = {
  'analyze-jd': object({
    coreResponsibilities: list(5), hardSkills: list(10), softSkills: list(8),
    keywords: list(10), niceToHave: list(6), interviewFocus: list(5),
    jdFocus: object({ product: level, data: level, ai: level, growth: level }),
  }),
  'match-resume': object({
    matchSummary: { type: 'string' }, matchLevel: level,
    matchedSkills: list(10), missingSkills: list(10), resumeStrengths: list(5),
    improvementSuggestions: list(5), interviewRiskAreas: list(5), keywordsToEmphasize: list(10),
  }),
  'interview-prep': object({
    highProbabilityQuestions: list(8), resumeQuestions: list(6), jdQuestions: list(6),
    behavioralQuestions: list(5), productQuestions: list(5), riskAreas: list(5), preparationPoints: list(6),
  }),
}

export function validateResult(value, schema) {
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    return Object.keys(value).every((key) => key in schema.properties) &&
      schema.required.every((key) => validateResult(value[key], schema.properties[key]))
  }
  if (schema.type === 'array') {
    return Array.isArray(value) && value.length <= schema.maxItems &&
      value.every((item) => typeof item === 'string' && item.trim().length > 0)
  }
  return typeof value === 'string' && (!schema.enum || schema.enum.includes(value))
}
