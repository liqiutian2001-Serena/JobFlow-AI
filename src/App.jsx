import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'jobflow-data'

const STATUS_OPTIONS = [
  'Applied',
  'Screening',
  'Interview',
  'Final Round',
  'Offer',
  'Rejected',
]

const SOURCE_OPTIONS = [
  'Official Website',
  'Campus',
  'Boss',
  'LinkedIn',
  'Referral',
  'Other',
]

const INITIAL_JOBS = [
  {
    id: 1,
    company: 'ByteDance',
    role: 'Product Manager',
    status: 'Interview',
    source: 'Campus',
  },
  {
    id: 2,
    company: 'JD.com',
    role: 'Product Operations',
    status: 'Applied',
    source: 'Official Website',
  },
  {
    id: 3,
    company: 'Meitu',
    role: 'Product Manager',
    status: 'Screening',
    source: 'Boss',
  },
  {
    id: 4,
    company: 'Pinduoduo',
    role: 'Product Operations',
    status: 'Applied',
    source: 'Campus',
  },
]

const INITIAL_COUNTS = {
  applications: 24,
  screening: 12,
  interview: 6,
  finalRound: 2,
  offer: 1,
}

const INITIAL_DATA = {
  jobs: INITIAL_JOBS,
  counts: INITIAL_COUNTS,
}

const COUNT_KEYS = [
  'applications',
  'screening',
  'interview',
  'finalRound',
  'offer',
]

const STATUS_CONTRIBUTIONS = {
  Applied: [1, 0, 0, 0, 0],
  Screening: [1, 1, 0, 0, 0],
  Interview: [1, 1, 1, 0, 0],
  'Final Round': [1, 1, 1, 1, 0],
  Offer: [1, 1, 1, 1, 1],
  Rejected: [1, 0, 0, 0, 0],
}

const EMPTY_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  source: 'Official Website',
  date: '',
  jobDescription: '',
}

const SAMPLE_JD = `Product Manager - AI & Growth

We are looking for a Product Manager to join our AI product team.

Responsibilities:

- Work with engineering, design and operations teams to define product requirements.
- Analyze user behavior and business data to identify growth opportunities.
- Conduct user research and translate insights into product solutions.
- Define product metrics and monitor conversion, retention and engagement.
- Manage product roadmap and prioritize features based on business impact.
- Support AI-powered product features and work with technical teams on implementation.

Requirements:

- Strong analytical and problem-solving skills.
- Experience with product management or product operations.
- Good understanding of user research, A/B testing and data analysis.
- Excellent communication and cross-functional collaboration skills.
- Ability to work in a fast-paced environment.
- Fluent English communication.

Preferred:

- Experience with AI products or large language models.
- Experience in growth, e-commerce or creator economy.
- Basic SQL knowledge is a plus.`

const RESUME_MATCH_SAMPLE_JD = `Product Manager - AI & Growth

Responsibilities:

- Define product requirements with engineering and design teams.
- Analyze user behavior and business data to identify growth opportunities.
- Conduct user research.
- Manage product roadmap and prioritize features.
- Work cross-functionally with engineering, design and operations.

Requirements:

- Product management or product operations experience.
- Strong analytical and problem-solving skills.
- Experience with data analysis and A/B testing.
- Strong communication skills.
- Experience with AI products is preferred.
- SQL knowledge is a plus.
- Experience in growth, e-commerce or creator economy is preferred.`

const RESUME_MATCH_SAMPLE_RESUME = `Product Intern

Experience:

- Worked on creator marketing products.
- Designed creator tags and improved creator search efficiency.
- Participated in AI-powered creator recommendation features.
- Analyzed product usage data and user behavior.
- Collaborated with product, engineering and operations teams.
- Conducted user research and collected business requirements.
- Experience in e-commerce and creator economy.
- Familiar with product metrics and conversion funnels.

Skills:
Product Management
Product Operations
Data Analysis
User Research
AI Products
E-commerce
Growth
Cross-functional Collaboration`

const RESUME_MATCH_SKILL_RULES = [
  {
    label: 'Product Management',
    pattern: /product management|product manager|product requirements?/i,
  },
  { label: 'Product Operations', pattern: /product operations/i },
  { label: 'AI', pattern: /\bai\b|ai-powered|artificial intelligence/i },
  {
    label: 'Large Language Models',
    pattern: /large language models?|\bllms?\b/i,
  },
  {
    label: 'Data Analysis',
    pattern: /data analysis|business data|product usage data|analy[sz]ed? .*data/i,
  },
  { label: 'SQL', pattern: /\bsql\b/i },
  { label: 'A/B Testing', pattern: /a\/b testing|\bab testing\b/i },
  { label: 'User Research', pattern: /user research/i },
  { label: 'Growth', pattern: /\bgrowth\b/i },
  { label: 'E-commerce', pattern: /e-commerce|ecommerce/i },
  { label: 'Creator Economy', pattern: /creator economy/i },
  { label: 'Product Metrics', pattern: /product metrics?/i },
  { label: 'Conversion Funnel', pattern: /conversion funnels?/i },
  { label: 'Roadmap', pattern: /\broadmap\b/i },
  { label: 'Analytics', pattern: /\banalytics\b/i },
  { label: 'Experimentation', pattern: /experimentation|experiments?/i },
  { label: 'Stakeholder Management', pattern: /stakeholder management/i },
  {
    label: 'Cross-functional Collaboration',
    pattern:
      /cross-functional|cross-functionally|collaborat(?:e|ed|ion).*engineering|work with engineering/i,
  },
  { label: 'Communication', pattern: /communication|communicat(?:e|ed|ing)/i },
  { label: 'Problem Solving', pattern: /problem-solving|problem solving/i },
  { label: 'Leadership', pattern: /leadership|team lead|led a team/i },
  { label: 'Ownership', pattern: /\bownership\b|\bowned\b/i },
]

const INTERVIEW_FOCUS_RULES = [
  {
    skills: ['Product Management', 'Product Operations', 'Roadmap'],
    value: 'Product Sense',
  },
  { skills: ['Data Analysis', 'SQL', 'Analytics'], value: 'Data Analysis' },
  { skills: ['AI', 'Large Language Models'], value: 'AI Product Thinking' },
  { skills: ['Growth', 'Conversion Funnel'], value: 'Growth' },
  {
    skills: ['Cross-functional Collaboration', 'Stakeholder Management'],
    value: 'Cross-functional Collaboration',
  },
  { skills: ['User Research'], value: 'User Research' },
]

const LIKELY_QUESTION_RULES = [
  {
    skills: ['Product Management', 'Product Operations'],
    value:
      'Tell me about a product you improved and how you identified the problem.',
  },
  {
    skills: ['Data Analysis', 'Analytics'],
    value: 'Tell me about a time you used data to make a product decision.',
  },
  {
    skills: ['User Research'],
    value: 'How have you used user research to influence a product decision?',
  },
  {
    skills: ['Growth', 'Conversion Funnel'],
    value: 'How would you diagnose a drop in conversion?',
  },
  {
    skills: ['AI', 'Large Language Models'],
    value: 'How would you design and evaluate an AI-powered product feature?',
  },
  {
    skills: ['Cross-functional Collaboration', 'Stakeholder Management'],
    value:
      'Tell me about a time you worked with engineering, design or operations to deliver a project.',
  },
  {
    skills: ['A/B Testing', 'Experimentation'],
    value: 'How would you design an A/B test for a product change?',
  },
  {
    skills: ['Roadmap'],
    value: 'How do you prioritize features when resources are limited?',
  },
]

const RESUME_QUESTION_RULES = [
  {
    pattern: /creator marketing/i,
    value: 'Tell me about your creator marketing product experience.',
  },
  {
    pattern: /ai-powered creator recommendation/i,
    value: 'What problem was the AI recommendation feature solving?',
  },
  {
    pattern: /user research/i,
    value: 'How did you conduct user research and what changed as a result?',
  },
  {
    pattern: /conversion funnels?/i,
    value: 'Which funnel metrics did you monitor and why?',
  },
  {
    pattern: /product usage data|user behavior/i,
    value: 'What insight did you find in product usage or user behavior data?',
  },
  {
    pattern: /collaborat(?:e|ed|ion).*engineering|cross-functional/i,
    value:
      'What was your role when collaborating with product, engineering or operations?',
  },
]

const GAP_QUESTION_RULES = [
  {
    skills: ['SQL'],
    value:
      'The role mentions SQL. How comfortable are you with querying or interpreting data?',
  },
  {
    skills: ['A/B Testing', 'Experimentation'],
    value:
      'The JD requires experimentation. What experience do you have with A/B testing?',
  },
  {
    skills: ['Roadmap'],
    value: 'How have you prioritized a roadmap or competing product requests?',
  },
  {
    skills: ['Communication'],
    value:
      'The role emphasizes communication. Which genuine example best shows how you communicate clearly?',
  },
  {
    skills: ['Problem Solving'],
    value: 'How would you approach an unfamiliar product or business problem?',
  },
  {
    skills: ['Leadership'],
    value: 'The role mentions leadership. What relevant experience can you discuss honestly?',
  },
]

const STAR_STORY_RULES = [
  {
    skills: ['User Research', 'Product Management'],
    value: 'Prepare one story about identifying a user problem.',
  },
  {
    skills: ['Data Analysis', 'Analytics', 'SQL'],
    value: 'Prepare one story about using data to make a decision.',
  },
  {
    skills: ['Cross-functional Collaboration', 'Stakeholder Management'],
    value: 'Prepare one story about cross-functional collaboration.',
  },
  {
    skills: ['Product Management', 'Roadmap'],
    value: 'Prepare one story about a difficult product trade-off.',
  },
  {
    skills: ['Growth', 'Product Metrics', 'Conversion Funnel'],
    value: 'Prepare one story about improving a business or product metric.',
  },
]

const RESPONSIBILITY_RULES = [
  {
    label: 'Product requirement definition',
    pattern: /define product requirements?|product requirement definition/i,
  },
  {
    label: 'User and data analysis',
    pattern: /analy[sz]e user behavior|business data|data analysis/i,
  },
  { label: 'User research', pattern: /user research/i },
  {
    label: 'Product roadmap management',
    pattern: /product roadmap|prioritize features/i,
  },
  {
    label: 'Cross-functional collaboration',
    pattern: /cross-functional|work with engineering|engineering, design and operations/i,
  },
  {
    label: 'Product metrics and performance monitoring',
    pattern: /product metrics|conversion|retention|engagement/i,
  },
]

const HARD_SKILL_RULES = [
  {
    label: 'Product Management',
    pattern: /product management|product manager|product requirements?/i,
  },
  { label: 'Product Operations', pattern: /product operations/i },
  { label: 'SQL', pattern: /\bsql\b/i },
  {
    label: 'Data Analysis',
    pattern: /data analysis|business data|analy[sz]e user behavior/i,
  },
  { label: 'A/B Testing', pattern: /a\/b testing|\bab testing\b/i },
  { label: 'User Research', pattern: /user research/i },
  { label: 'AI', pattern: /\bai\b|ai-powered|artificial intelligence/i },
  {
    label: 'Large Language Models',
    pattern: /large language models?|\bllms?\b/i,
  },
  { label: 'E-commerce', pattern: /e-commerce|ecommerce/i },
  { label: 'Growth', pattern: /\bgrowth\b/i },
  { label: 'Analytics', pattern: /\banalytics?\b/i },
  { label: 'Product Metrics', pattern: /product metrics?/i },
  { label: 'Roadmap', pattern: /\broadmap\b/i },
]

const SOFT_SKILL_RULES = [
  { label: 'Communication', pattern: /communication|communicate/i },
  {
    label: 'Collaboration',
    pattern: /collaboration|cross-functional|work with engineering/i,
  },
  { label: 'Problem Solving', pattern: /problem-solving|problem solving/i },
  { label: 'Analytical Thinking', pattern: /analytical|analytical thinking/i },
  { label: 'Ownership', pattern: /\bownership\b|\bown\b/i },
  { label: 'Leadership', pattern: /leadership|lead a team|team lead/i },
  { label: 'Fast-paced Adaptability', pattern: /fast-paced|adaptability/i },
  { label: 'Stakeholder Management', pattern: /stakeholder management/i },
]

const KEYWORD_RULES = [
  { label: 'AI', pattern: /\bai\b|ai-powered|artificial intelligence/i },
  { label: 'Growth', pattern: /\bgrowth\b/i },
  {
    label: 'Product Management',
    pattern: /product management|product manager|product requirements?/i,
  },
  {
    label: 'Data Analysis',
    pattern: /data analysis|business data|analy[sz]e user behavior/i,
  },
  { label: 'User Research', pattern: /user research/i },
  { label: 'Cross-functional', pattern: /cross-functional|work with engineering/i },
  { label: 'A/B Testing', pattern: /a\/b testing|\bab testing\b/i },
  { label: 'SQL', pattern: /\bsql\b/i },
  { label: 'Product Metrics', pattern: /product metrics?/i },
  { label: 'Roadmap', pattern: /\broadmap\b/i },
  { label: 'Product Operations', pattern: /product operations/i },
  {
    label: 'Large Language Models',
    pattern: /large language models?|\bllms?\b/i,
  },
  { label: 'E-commerce', pattern: /e-commerce|ecommerce/i },
]

function matchRules(text, rules) {
  return rules.filter((rule) => rule.pattern.test(text)).map((rule) => rule.label)
}

function extractRequiredSkills(text) {
  return matchRules(text, RESUME_MATCH_SKILL_RULES)
}

function extractResumeSkills(text) {
  return matchRules(text, RESUME_MATCH_SKILL_RULES)
}

function compareSkills(requiredSkills, resumeSkills) {
  const resumeSkillSet = new Set(resumeSkills)

  return {
    matchedSkills: requiredSkills.filter((skill) => resumeSkillSet.has(skill)),
    missingSkills: requiredSkills.filter((skill) => !resumeSkillSet.has(skill)),
  }
}

function selectSkillBasedItems(skills, rules, maxItems) {
  const skillSet = new Set(skills)

  return rules
    .filter((rule) => rule.skills.some((skill) => skillSet.has(skill)))
    .map((rule) => rule.value)
    .slice(0, maxItems)
}

function generateInterviewPrepFocus(requiredSkills) {
  return selectSkillBasedItems(requiredSkills, INTERVIEW_FOCUS_RULES, 6)
}

function generateLikelyQuestions(requiredSkills) {
  return selectSkillBasedItems(requiredSkills, LIKELY_QUESTION_RULES, 8)
}

function generateResumeBasedQuestions(resume) {
  return RESUME_QUESTION_RULES.filter((rule) => rule.pattern.test(resume))
    .map((rule) => rule.value)
    .slice(0, 6)
}

function generateGapQuestions(missingSkills) {
  return selectSkillBasedItems(missingSkills, GAP_QUESTION_RULES, 5)
}

function generateSTARStories(requiredSkills) {
  const stories = selectSkillBasedItems(requiredSkills, STAR_STORY_RULES, 5)

  stories.push('Prepare one story about failure or disagreement.')
  return stories.slice(0, 6)
}

function generatePreparationChecklist(requiredSkills) {
  const required = new Set(requiredSkills)
  const checklist = [
    "Understand the company's product.",
    "Understand the role's key metrics.",
    'Prepare 3–5 STAR stories.',
    'Review your strongest matching experiences.',
    'Prepare answers for missing-skill areas.',
    'Prepare 2–3 questions for the interviewer.',
  ]

  if (required.has('AI') || required.has('Large Language Models')) {
    checklist.push(
      'Be ready to discuss AI product evaluation, hallucination, latency and cost trade-offs.',
    )
  }
  if (required.has('Growth')) {
    checklist.push(
      'Be ready to explain a growth funnel and North Star metric.',
    )
  }

  return checklist
}

function calculatePreparationPriority(requiredSkills, matchedSkills, missingSkills) {
  const missing = new Set(missingSkills)
  const matched = new Set(matchedSkills)
  const coreSkills = new Set(['Product Management', 'AI', 'Data Analysis'])
  const mediumSkills = new Set([
    'Growth',
    'User Research',
    'Cross-functional Collaboration',
    'Stakeholder Management',
  ])
  const high = requiredSkills.filter(
    (skill) => missing.has(skill) || coreSkills.has(skill),
  )
  const medium = requiredSkills.filter(
    (skill) =>
      matched.has(skill) && !high.includes(skill) && mediumSkills.has(skill),
  )
  const lower = requiredSkills.filter(
    (skill) =>
      matched.has(skill) && !high.includes(skill) && !medium.includes(skill),
  )

  return { high, medium, lower }
}

function generateInterviewPrep(jd, resume) {
  const requiredSkills = extractRequiredSkills(jd)
  const resumeSkills = extractResumeSkills(resume)
  const { matchedSkills, missingSkills } = compareSkills(
    requiredSkills,
    resumeSkills,
  )

  return {
    priority: calculatePreparationPriority(
      requiredSkills,
      matchedSkills,
      missingSkills,
    ),
    focus: generateInterviewPrepFocus(requiredSkills),
    likelyQuestions: generateLikelyQuestions(requiredSkills),
    resumeQuestions: generateResumeBasedQuestions(resume),
    gapQuestions: generateGapQuestions(missingSkills),
    starStories: generateSTARStories(requiredSkills),
    checklist: generatePreparationChecklist(requiredSkills),
  }
}

function generateResumeStrengths(matchedSkills) {
  const matched = new Set(matchedSkills)
  const strengths = []

  if (matched.has('AI') && matched.has('Product Management')) {
    strengths.push('Your resume already shows relevant AI product experience.')
  }
  if (matched.has('Growth') && matched.has('Data Analysis')) {
    strengths.push(
      'Your resume demonstrates a combination of growth and data-driven product experience.',
    )
  }
  if (matched.has('Creator Economy')) {
    strengths.push(
      'Your creator economy experience is particularly relevant to this role.',
    )
  }
  if (matched.has('Cross-functional Collaboration')) {
    strengths.push(
      'Your resume shows experience working across product, engineering or operations teams.',
    )
  }
  if (matched.has('User Research') && strengths.length < 4) {
    strengths.push('Your resume includes relevant user research experience.')
  }

  if (strengths.length === 0) {
    strengths.push(
      'No clear strengths were found in the supported skill list yet.',
    )
  }

  return strengths.slice(0, 4)
}

function generateResumeSuggestions(missingSkills) {
  const missing = new Set(missingSkills)
  const suggestions = []

  if (missing.has('SQL')) {
    suggestions.push(
      'The JD mentions SQL, but your resume does not currently show SQL experience.',
    )
  }
  if (missing.has('A/B Testing') || missing.has('Experimentation')) {
    suggestions.push(
      'Consider highlighting any experimentation or A/B testing experience if you genuinely have it.',
    )
  }
  if (missing.has('Roadmap')) {
    suggestions.push(
      'If you have roadmap or prioritization experience, make it more explicit.',
    )
  }
  if (missing.has('Stakeholder Management')) {
    suggestions.push(
      'If you genuinely have stakeholder management experience, describe one clear example.',
    )
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'Keep your existing examples specific and connect them clearly to the role.',
    )
  }

  suggestions.push('Only highlight skills or experiences you genuinely have.')
  return suggestions.slice(0, 5)
}

function generateInterviewRisks(missingSkills) {
  const missing = new Set(missingSkills)
  const risks = []

  if (missing.has('SQL')) {
    risks.push('The interviewer may ask about SQL or data querying.')
  }
  if (missing.has('A/B Testing') || missing.has('Experimentation')) {
    risks.push('Be ready to explain your experience with experimentation.')
  }
  if (missing.has('Roadmap')) {
    risks.push('You may be asked how you prioritize a product roadmap.')
  }
  if (missing.has('Stakeholder Management')) {
    risks.push('You may be asked how you manage stakeholder expectations.')
  }
  if (missing.has('Leadership')) {
    risks.push('The interviewer may ask for an example of leadership.')
  }

  if (risks.length === 0) {
    risks.push(
      'Prepare examples that prove the matched skills shown in your resume.',
    )
  }

  return risks.slice(0, 5)
}

function matchResumeToJD(jd, resume) {
  const requiredSkills = extractRequiredSkills(jd)
  const resumeSkills = extractResumeSkills(resume)
  const { matchedSkills, missingSkills } = compareSkills(
    requiredSkills,
    resumeSkills,
  )
  const matchRatio = requiredSkills.length
    ? matchedSkills.length / requiredSkills.length
    : 0
  const matchLevel =
    matchRatio >= 0.7
      ? 'Strong Match'
      : matchRatio >= 0.4
        ? 'Moderate Match'
        : 'Limited Match'

  return {
    requiredSkills,
    matchedSkills,
    missingSkills,
    matchLevel,
    strengths: generateResumeStrengths(matchedSkills),
    suggestions: generateResumeSuggestions(missingSkills),
    interviewRisks: generateInterviewRisks(missingSkills),
    keywordsToEmphasize: matchedSkills.slice(0, 8),
  }
}

function extractResponsibilities(text) {
  const matchedResponsibilities = matchRules(text, RESPONSIBILITY_RULES)

  if (matchedResponsibilities.length > 0) {
    return matchedResponsibilities.slice(0, 5)
  }

  const section = text.match(
    /responsibilities\s*:([\s\S]*?)(?:\n\s*(?:requirements?|qualifications?)\s*:|$)/i,
  )
  const lines = (section?.[1] ?? text).split('\n')

  return lines
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 5)
}

function extractSkills(text, rules) {
  return matchRules(text, rules)
}

function extractNiceToHave(text) {
  const lines = text.split('\n').map((line) => line.trim())
  const items = []
  let isNiceToHaveSection = false

  for (const line of lines) {
    if (/^(preferred|nice to have|bonus)\s*:/i.test(line)) {
      isNiceToHaveSection = true
      const inlineText = line.replace(/^[^:]+:\s*/, '')

      if (inlineText) {
        items.push(inlineText)
      }
      continue
    }

    if (
      isNiceToHaveSection &&
      /^[a-z][a-z /&-]{1,40}:$/i.test(line) &&
      !/^(preferred|nice to have|bonus)\s*:/i.test(line)
    ) {
      break
    }

    if (isNiceToHaveSection && line) {
      items.push(line.replace(/^[-*•]\s*/, ''))
    }
  }

  if (items.length > 0) {
    return items.slice(0, 5)
  }

  return lines
    .filter((line) => /nice to have|bonus|preferred|is a plus/i.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, ''))
    .slice(0, 5)
}

function generateInterviewFocus(hardSkills, softSkills) {
  const suggestions = []

  if (hardSkills.includes('Data Analysis')) {
    suggestions.push(
      'Prepare one example where you used data to identify a product or business problem.',
    )
  }
  if (hardSkills.includes('User Research')) {
    suggestions.push(
      'Prepare one example of how user research changed your product decision.',
    )
  }
  if (
    hardSkills.includes('AI') ||
    hardSkills.includes('Large Language Models')
  ) {
    suggestions.push(
      'Be ready to explain how you would design or evaluate an AI-powered product feature.',
    )
  }
  if (hardSkills.includes('Growth')) {
    suggestions.push(
      'Prepare to explain a growth funnel and the key metric you would optimize.',
    )
  }
  if (softSkills.includes('Collaboration')) {
    suggestions.push(
      'Prepare a STAR example of working with engineering, design or operations teams.',
    )
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'Prepare examples that show how your experience matches the main responsibilities.',
    )
  }

  return suggestions.slice(0, 5)
}

function focusLevel(evidenceCount, highThreshold) {
  if (evidenceCount >= highThreshold) {
    return 'High'
  }

  return evidenceCount > 0 ? 'Medium' : 'Low'
}

function calculateJDFocus(hardSkills) {
  const countSkills = (skills) =>
    skills.filter((skill) => hardSkills.includes(skill)).length

  return [
    {
      label: 'Product',
      level: focusLevel(
        countSkills([
          'Product Management',
          'Product Operations',
          'Product Metrics',
          'Roadmap',
          'User Research',
        ]),
        3,
      ),
    },
    {
      label: 'Data',
      level: focusLevel(
        countSkills([
          'Data Analysis',
          'SQL',
          'A/B Testing',
          'Analytics',
          'Product Metrics',
        ]),
        5,
      ),
    },
    {
      label: 'AI',
      level: focusLevel(countSkills(['AI', 'Large Language Models']), 2),
    },
    {
      label: 'Growth',
      level: focusLevel(countSkills(['Growth', 'E-commerce', 'Analytics']), 3),
    },
  ]
}

function analyzeJD(text) {
  const hardSkills = extractSkills(text, HARD_SKILL_RULES)
  const softSkills = extractSkills(text, SOFT_SKILL_RULES)

  return {
    responsibilities: extractResponsibilities(text),
    hardSkills,
    softSkills,
    keywords: matchRules(text, KEYWORD_RULES).slice(0, 10),
    niceToHave: extractNiceToHave(text),
    interviewFocus: generateInterviewFocus(hardSkills, softSkills),
    focus: calculateJDFocus(hardSkills),
  }
}

function formatAIAnalysis(analysis) {
  const listKeys = [
    'coreResponsibilities',
    'hardSkills',
    'softSkills',
    'keywords',
    'niceToHave',
    'interviewFocus',
  ]
  const hasValidLists = listKeys.every(
    (key) =>
      Array.isArray(analysis?.[key]) &&
      analysis[key].every((item) => typeof item === 'string'),
  )
  const focusLabels = {
    product: 'Product',
    data: 'Data',
    ai: 'AI',
    growth: 'Growth',
  }
  const validLevels = ['High', 'Medium', 'Low']
  const hasValidFocus = Object.keys(focusLabels).every((key) =>
    validLevels.includes(analysis?.jdFocus?.[key]),
  )

  if (!hasValidLists || !hasValidFocus) {
    throw new Error('INVALID_AI_RESPONSE')
  }

  return {
    responsibilities: analysis.coreResponsibilities.slice(0, 5),
    hardSkills: analysis.hardSkills.slice(0, 10),
    softSkills: analysis.softSkills.slice(0, 8),
    keywords: analysis.keywords.slice(0, 10),
    niceToHave: analysis.niceToHave.slice(0, 6),
    interviewFocus: analysis.interviewFocus.slice(0, 5),
    focus: Object.entries(focusLabels).map(([key, label]) => ({
      label,
      level: analysis.jdFocus[key],
    })),
  }
}

function loadJobFlowData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      return INITIAL_DATA
    }

    const parsedData = JSON.parse(savedData)
    const hasValidJobs =
      Array.isArray(parsedData.jobs) &&
      parsedData.jobs.every(
        (job) =>
          job &&
          (typeof job.id === 'number' || typeof job.id === 'string') &&
          typeof job.company === 'string' &&
          typeof job.role === 'string' &&
          STATUS_OPTIONS.includes(job.status) &&
          SOURCE_OPTIONS.includes(job.source),
      )
    const hasValidCounts =
      parsedData.counts &&
      COUNT_KEYS.every(
        (key) =>
          Number.isInteger(parsedData.counts[key]) &&
          parsedData.counts[key] >= 0,
      )

    if (!hasValidJobs || !hasValidCounts) {
      return INITIAL_DATA
    }

    return {
      jobs: parsedData.jobs,
      counts: parsedData.counts,
    }
  } catch {
    return INITIAL_DATA
  }
}

function applyStatusContribution(counts, status, direction) {
  const contribution = STATUS_CONTRIBUTIONS[status]

  return COUNT_KEYS.reduce(
    (next, key, index) => ({
      ...next,
      [key]: counts[key] + contribution[index] * direction,
    }),
    {},
  )
}

function App() {
  const [data, setData] = useState(loadJobFlowData)
  const [activeView, setActiveView] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [jdText, setJdText] = useState('')
  const [jdAnalysis, setJdAnalysis] = useState(null)
  const [jdError, setJdError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiConfigured, setAiConfigured] = useState(null)
  const [showBasicFallback, setShowBasicFallback] = useState(false)
  const [resumeMatchJD, setResumeMatchJD] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeMatchResult, setResumeMatchResult] = useState(null)
  const [resumeMatchError, setResumeMatchError] = useState('')
  const [interviewPrepJD, setInterviewPrepJD] = useState('')
  const [interviewPrepResume, setInterviewPrepResume] = useState('')
  const [interviewPrepResult, setInterviewPrepResult] = useState(null)
  const [interviewPrepError, setInterviewPrepError] = useState('')
  const { jobs, counts } = data

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Keep the page usable if browser storage is unavailable.
    }
  }, [data])

  useEffect(() => {
    let isCurrent = true

    async function checkAIStatus() {
      try {
        const response = await fetch('/api/status')
        const status = await response.json()

        if (isCurrent) {
          setAiConfigured(response.ok && status.configured === true)
        }
      } catch {
        if (isCurrent) {
          setAiConfigured(false)
        }
      }
    }

    checkAIStatus()

    return () => {
      isCurrent = false
    }
  }, [])

  const interviewRate = counts.applications
    ? Math.round((counts.interview / counts.applications) * 100)
    : 0

  function openAddModal() {
    setError('')
    setForm(EMPTY_FORM)
    setEditingJobId(null)
    setIsModalOpen(true)
  }

  function openEditModal(job) {
    setError('')
    setForm({
      company: job.company,
      role: job.role,
      status: job.status,
      source: job.source,
      date: job.date ?? '',
      jobDescription: job.jobDescription ?? '',
    })
    setEditingJobId(job.id)
    setIsModalOpen(true)
  }

  function closeModal() {
    setError('')
    setForm(EMPTY_FORM)
    setEditingJobId(null)
    setIsModalOpen(false)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function submitJob(event) {
    event.preventDefault()

    if (!form.company.trim() || !form.role.trim()) {
      setError('Please fill in Company and Role.')
      return
    }

    const jobDetails = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      source: form.source,
      date: form.date,
      jobDescription: form.jobDescription,
    }

    if (editingJobId !== null) {
      setData((current) => {
        const originalJob = current.jobs.find(
          (job) => job.id === editingJobId,
        )

        if (!originalJob) {
          return current
        }

        let nextJobCounts = current.counts

        if (originalJob.status !== form.status) {
          nextJobCounts = applyStatusContribution(
            nextJobCounts,
            originalJob.status,
            -1,
          )
          nextJobCounts = applyStatusContribution(
            nextJobCounts,
            form.status,
            1,
          )
        }

        return {
          jobs: current.jobs.map((job) =>
            job.id === editingJobId ? { ...job, ...jobDetails } : job,
          ),
          counts: nextJobCounts,
        }
      })
    } else {
      const newJob = {
        id: Date.now(),
        ...jobDetails,
      }

      setData((current) => ({
        jobs: [newJob, ...current.jobs],
        counts: applyStatusContribution(current.counts, form.status, 1),
      }))
    }

    closeModal()
  }

  function deleteJob() {
    setData((current) => {
      const currentJob = current.jobs.find(
        (job) => job.id === jobToDelete.id,
      )

      if (!currentJob) {
        return current
      }

      return {
        jobs: current.jobs.filter((job) => job.id !== currentJob.id),
        counts: applyStatusContribution(current.counts, currentJob.status, -1),
      }
    })
    setJobToDelete(null)
  }

  function updateJDText(event) {
    setJdText(event.target.value)
    setJdError('')
    setShowBasicFallback(false)
  }

  function loadSampleJD() {
    setJdText(SAMPLE_JD)
    setJdAnalysis(null)
    setJdError('')
    setShowBasicFallback(false)
  }

  async function handleAnalyzeJD() {
    if (!jdText.trim()) {
      setJdAnalysis(null)
      setJdError('Please paste a job description first.')
      setShowBasicFallback(false)
      return
    }

    setIsAnalyzing(true)
    setJdAnalysis(null)
    setJdError('')
    setShowBasicFallback(false)

    try {
      const response = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jdText }),
      })

      let result

      try {
        result = await response.json()
      } catch {
        throw new Error('INVALID_AI_RESPONSE')
      }

      if (!response.ok) {
        if (result.code === 'AI_NOT_CONFIGURED') {
          setAiConfigured(false)
          setJdError('AI service is not configured yet.')
        } else if (result.code === 'AI_RESPONSE_INVALID') {
          setJdError('AI returned an unexpected result. Please try again.')
        } else {
          setJdError('AI analysis failed. Please try again.')
        }

        setShowBasicFallback(true)
        return
      }

      setJdAnalysis(formatAIAnalysis(result))
      setAiConfigured(true)
    } catch (requestError) {
      if (requestError.message === 'INVALID_AI_RESPONSE') {
        setJdError('AI returned an unexpected result. Please try again.')
      } else {
        setJdError('AI analysis failed. Please try again.')
      }

      setShowBasicFallback(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function useBasicAnalysis() {
    if (!jdText.trim()) {
      setJdAnalysis(null)
      setJdError('Please paste a job description first.')
      setShowBasicFallback(false)
      return
    }

    setJdAnalysis(analyzeJD(jdText))
    setJdError('')
    setShowBasicFallback(false)
  }

  function clearJD() {
    setJdText('')
    setJdAnalysis(null)
    setJdError('')
    setShowBasicFallback(false)
  }

  function updateResumeMatchJD(event) {
    setResumeMatchJD(event.target.value)
    setResumeMatchError('')
  }

  function updateResumeText(event) {
    setResumeText(event.target.value)
    setResumeMatchError('')
  }

  function loadResumeMatchSample() {
    setResumeMatchJD(RESUME_MATCH_SAMPLE_JD)
    setResumeText(RESUME_MATCH_SAMPLE_RESUME)
    setResumeMatchResult(null)
    setResumeMatchError('')
  }

  function handleResumeMatch() {
    if (!resumeMatchJD.trim()) {
      setResumeMatchResult(null)
      setResumeMatchError('Please paste a job description.')
      return
    }

    if (!resumeText.trim()) {
      setResumeMatchResult(null)
      setResumeMatchError('Please paste your resume.')
      return
    }

    setResumeMatchResult(matchResumeToJD(resumeMatchJD, resumeText))
    setResumeMatchError('')
  }

  function clearResumeMatch() {
    setResumeMatchJD('')
    setResumeText('')
    setResumeMatchResult(null)
    setResumeMatchError('')
  }

  function updateInterviewPrepJD(event) {
    setInterviewPrepJD(event.target.value)
    setInterviewPrepError('')
  }

  function updateInterviewPrepResume(event) {
    setInterviewPrepResume(event.target.value)
    setInterviewPrepError('')
  }

  function loadInterviewPrepSample() {
    setInterviewPrepJD(RESUME_MATCH_SAMPLE_JD)
    setInterviewPrepResume(RESUME_MATCH_SAMPLE_RESUME)
    setInterviewPrepResult(null)
    setInterviewPrepError('')
  }

  function handleGenerateInterviewPrep() {
    if (!interviewPrepJD.trim()) {
      setInterviewPrepResult(null)
      setInterviewPrepError('Please paste a job description.')
      return
    }

    if (!interviewPrepResume.trim()) {
      setInterviewPrepResult(null)
      setInterviewPrepError('Please paste your resume.')
      return
    }

    setInterviewPrepResult(
      generateInterviewPrep(interviewPrepJD, interviewPrepResume),
    )
    setInterviewPrepError('')
  }

  function clearInterviewPrep() {
    setInterviewPrepJD('')
    setInterviewPrepResume('')
    setInterviewPrepResult(null)
    setInterviewPrepError('')
  }

  return (
    <div className="page">
      <header className="nav">
        <div className="nav-inner">
          <div className="logo">JobFlow AI</div>
          <nav className="nav-links" aria-label="Primary">
            <button
              type="button"
              className={`nav-link ${
                activeView === 'dashboard' ? 'active' : ''
              }`}
              aria-current={activeView === 'dashboard' ? 'page' : undefined}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`nav-link ${activeView === 'jobs' ? 'active' : ''}`}
              aria-current={activeView === 'jobs' ? 'page' : undefined}
              onClick={() => setActiveView('jobs')}
            >
              Jobs
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeView === 'jd-analyzer' ? 'active' : ''
              }`}
              aria-current={activeView === 'jd-analyzer' ? 'page' : undefined}
              onClick={() => setActiveView('jd-analyzer')}
            >
              JD Analyzer
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeView === 'resume-match' ? 'active' : ''
              }`}
              aria-current={activeView === 'resume-match' ? 'page' : undefined}
              onClick={() => setActiveView('resume-match')}
            >
              Resume Match
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeView === 'interview-prep' ? 'active' : ''
              }`}
              aria-current={
                activeView === 'interview-prep' ? 'page' : undefined
              }
              onClick={() => setActiveView('interview-prep')}
            >
              Interview Prep
            </button>
          </nav>
        </div>
      </header>

      <main>
        {activeView === 'dashboard' ? (
          <>
            <section className="hero">
              <div className="hero-inner">
                <h1>Your AI Job Search Copilot</h1>
                <p className="subtitle">
                  Track applications, analyze job descriptions, prepare for
                  interviews, and understand your job search funnel.
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddModal}
                  >
                    Add a Job
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveView('jd-analyzer')}
                  >
                    Analyze a JD
                  </button>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-inner">
                <h2>Dashboard Preview</h2>
                <div className="stat-grid">
                  <article className="card">
                    <p className="card-label">Applications</p>
                    <p className="card-value">{counts.applications}</p>
                  </article>
                  <article className="card">
                    <p className="card-label">Interviews</p>
                    <p className="card-value">{counts.interview}</p>
                  </article>
                  <article className="card">
                    <p className="card-label">Interview Rate</p>
                    <p className="card-value">{interviewRate}%</p>
                  </article>
                  <article className="card">
                    <p className="card-label">Offers</p>
                    <p className="card-value">{counts.offer}</p>
                  </article>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-inner">
                <h2>Job Search Funnel</h2>
                <div className="funnel">
                  <article className="funnel-step">
                    <p className="card-label">Applied</p>
                    <p className="card-value">{counts.applications}</p>
                  </article>
                  <article className="funnel-step">
                    <p className="card-label">Screening</p>
                    <p className="card-value">{counts.screening}</p>
                  </article>
                  <article className="funnel-step">
                    <p className="card-label">Interview</p>
                    <p className="card-value">{counts.interview}</p>
                  </article>
                  <article className="funnel-step">
                    <p className="card-label">Final Round</p>
                    <p className="card-value">{counts.finalRound}</p>
                  </article>
                  <article className="funnel-step">
                    <p className="card-label">Offer</p>
                    <p className="card-value">{counts.offer}</p>
                  </article>
                </div>
              </div>
            </section>

            <section className="section section-last">
              <div className="section-inner">
                <h2>Recent Applications</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.company}</td>
                          <td>{job.role}</td>
                          <td>{job.status}</td>
                          <td>{job.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : activeView === 'jobs' ? (
          <section className="jobs-page">
            <div className="section-inner">
              <div className="jobs-header">
                <div>
                  <h1>Job Tracker</h1>
                  <p>Manage all your job applications in one place.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAddModal}
                >
                  Add a Job
                </button>
              </div>

              <div className="table-wrap jobs-table-wrap">
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Application Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>{job.company}</td>
                        <td>{job.role}</td>
                        <td>
                          <span
                            className={`status-badge status-${job.status
                              .toLowerCase()
                              .replaceAll(' ', '-')}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td>{job.source}</td>
                        <td>{job.date || '—'}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="action-btn"
                              onClick={() => openEditModal(job)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn action-delete"
                              onClick={() => setJobToDelete(job)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : activeView === 'jd-analyzer' ? (
          <section className="jd-page">
            <div className="section-inner jd-inner">
              <header className="jd-header">
                <h1>JD Analyzer</h1>
                <p>Understand what the role really requires before you apply.</p>
              </header>

              <div className="jd-input-card">
                <label htmlFor="jd-text">Paste Job Description</label>
                <textarea
                  id="jd-text"
                  value={jdText}
                  onChange={updateJDText}
                  placeholder="Paste the full job description here..."
                />
                <div className="jd-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAnalyzeJD}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze JD'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadSampleJD}
                    disabled={isAnalyzing}
                  >
                    Load Sample JD
                  </button>
                  <button
                    type="button"
                    className="btn btn-plain"
                    onClick={clearJD}
                    disabled={isAnalyzing}
                  >
                    Clear
                  </button>
                </div>
                {jdError ? (
                  <div className="jd-error-row">
                    <p className="jd-error" role="alert">
                      {jdError}
                    </p>
                    {showBasicFallback ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={useBasicAnalysis}
                      >
                        Use Basic Analysis
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {jdAnalysis ? (
                <div className="jd-results" aria-live="polite">
                  <section className="focus-preview">
                    <div className="focus-heading">
                      <p>JD Complexity / Match Preparation Preview</p>
                      <h2>JD Focus</h2>
                    </div>
                    <div className="focus-grid">
                      {jdAnalysis.focus.map((item) => (
                        <div className="focus-item" key={item.label}>
                          <span>{item.label}</span>
                          <strong
                            className={`focus-level focus-${item.level.toLowerCase()}`}
                          >
                            {item.level}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="analysis-grid">
                    <article className="analysis-card">
                      <h2>Core Responsibilities</h2>
                      <ul>
                        {jdAnalysis.responsibilities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="analysis-card">
                      <h2>Hard Skills</h2>
                      {jdAnalysis.hardSkills.length > 0 ? (
                        <div className="keyword-list">
                          {jdAnalysis.hardSkills.map((skill) => (
                            <span className="keyword-tag" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No supported hard-skill keywords found.</p>
                      )}
                    </article>

                    <article className="analysis-card">
                      <h2>Soft Skills</h2>
                      {jdAnalysis.softSkills.length > 0 ? (
                        <div className="keyword-list">
                          {jdAnalysis.softSkills.map((skill) => (
                            <span className="keyword-tag keyword-tag-soft" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No supported soft-skill keywords found.</p>
                      )}
                    </article>

                    <article className="analysis-card">
                      <h2>Key JD Keywords</h2>
                      {jdAnalysis.keywords.length > 0 ? (
                        <div className="keyword-list">
                          {jdAnalysis.keywords.map((keyword) => (
                            <span className="keyword-tag keyword-tag-key" key={keyword}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No supported JD keywords found.</p>
                      )}
                    </article>

                    <article className="analysis-card">
                      <h2>Nice to Have</h2>
                      {jdAnalysis.niceToHave.length > 0 ? (
                        <ul>
                          {jdAnalysis.niceToHave.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No explicit nice-to-have requirements found.</p>
                      )}
                    </article>

                    <article className="analysis-card">
                      <h2>Interview Focus</h2>
                      <ul>
                        {jdAnalysis.interviewFocus.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </div>
              ) : null}

              <p className="jd-disclaimer">
                {aiConfigured === null
                  ? 'Checking AI service availability...'
                  : aiConfigured
                    ? 'AI-powered JD analysis with a local basic-analysis fallback.'
                    : 'AI service is not configured. Local basic analysis is available.'}
              </p>
            </div>
          </section>
        ) : activeView === 'resume-match' ? (
          <section className="resume-match-page">
            <div className="section-inner">
              <header className="resume-match-header">
                <h1>Resume Match</h1>
                <p>
                  See how well your resume aligns with the role before you
                  apply.
                </p>
              </header>

              <div className="resume-match-input-card">
                <div className="resume-match-inputs">
                  <label className="resume-match-field" htmlFor="match-jd">
                    Job Description
                    <textarea
                      id="match-jd"
                      value={resumeMatchJD}
                      onChange={updateResumeMatchJD}
                      placeholder="Paste the job description here..."
                    />
                  </label>
                  <label className="resume-match-field" htmlFor="match-resume">
                    Resume
                    <textarea
                      id="match-resume"
                      value={resumeText}
                      onChange={updateResumeText}
                      placeholder="Paste your resume here..."
                    />
                  </label>
                </div>

                <div className="resume-match-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleResumeMatch}
                  >
                    Match Resume
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadResumeMatchSample}
                  >
                    Load Sample
                  </button>
                  <button
                    type="button"
                    className="btn btn-plain"
                    onClick={clearResumeMatch}
                  >
                    Clear
                  </button>
                </div>

                {resumeMatchError ? (
                  <p className="resume-match-error" role="alert">
                    {resumeMatchError}
                  </p>
                ) : null}
              </div>

              {resumeMatchResult ? (
                <div className="resume-match-results" aria-live="polite">
                  <section className="match-overview-card">
                    <div>
                      <p>Match Overview</p>
                      <h2>{resumeMatchResult.matchLevel}</h2>
                    </div>
                    <strong
                      className={`match-level match-${resumeMatchResult.matchLevel
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                    >
                      {resumeMatchResult.matchedSkills.length} of{' '}
                      {resumeMatchResult.requiredSkills.length} key skills
                      matched
                    </strong>
                  </section>

                  <div className="match-results-grid">
                    <article className="match-result-card">
                      <h2>Matched Skills</h2>
                      {resumeMatchResult.matchedSkills.length > 0 ? (
                        <div className="keyword-list">
                          {resumeMatchResult.matchedSkills.map((skill) => (
                            <span className="match-skill-tag" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No matching skills found in both texts.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>Missing Skills</h2>
                      {resumeMatchResult.missingSkills.length > 0 ? (
                        <div className="keyword-list">
                          {resumeMatchResult.missingSkills.map((skill) => (
                            <span
                              className="match-skill-tag match-skill-missing"
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No missing skills found in the supported skill list.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>Resume Strengths</h2>
                      <ul>
                        {resumeMatchResult.strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="match-result-card">
                      <h2>Resume Improvement Suggestions</h2>
                      <ul>
                        {resumeMatchResult.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="match-result-card">
                      <h2>Interview Risk Areas</h2>
                      <ul>
                        {resumeMatchResult.interviewRisks.map((risk) => (
                          <li key={risk}>{risk}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="match-result-card">
                      <h2>Resume Keywords to Emphasize</h2>
                      {resumeMatchResult.keywordsToEmphasize.length > 0 ? (
                        <div className="keyword-list">
                          {resumeMatchResult.keywordsToEmphasize.map(
                            (keyword) => (
                              <span
                                className="match-skill-tag match-keyword-tag"
                                key={keyword}
                              >
                                {keyword}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <p>No demonstrated keywords to recommend yet.</p>
                      )}
                    </article>
                  </div>
                </div>
              ) : null}

              <p className="resume-match-disclaimer">
                Resume Match V1 uses local keyword matching. It does not infer
                experience that is not written in your resume.
              </p>
            </div>
          </section>
        ) : (
          <section className="resume-match-page">
            <div className="section-inner">
              <header className="resume-match-header">
                <h1>Interview Prep</h1>
                <p>
                  Prepare the questions most likely to come up in your
                  interview.
                </p>
              </header>

              <div className="resume-match-input-card">
                <div className="resume-match-inputs">
                  <label className="resume-match-field" htmlFor="prep-jd">
                    Job Description
                    <textarea
                      id="prep-jd"
                      value={interviewPrepJD}
                      onChange={updateInterviewPrepJD}
                      placeholder="Paste the job description here..."
                    />
                  </label>
                  <label className="resume-match-field" htmlFor="prep-resume">
                    Resume
                    <textarea
                      id="prep-resume"
                      value={interviewPrepResume}
                      onChange={updateInterviewPrepResume}
                      placeholder="Paste your resume here..."
                    />
                  </label>
                </div>

                <div className="resume-match-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGenerateInterviewPrep}
                  >
                    Generate Interview Prep
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadInterviewPrepSample}
                  >
                    Load Sample
                  </button>
                  <button
                    type="button"
                    className="btn btn-plain"
                    onClick={clearInterviewPrep}
                  >
                    Clear
                  </button>
                </div>

                {interviewPrepError ? (
                  <p className="resume-match-error" role="alert">
                    {interviewPrepError}
                  </p>
                ) : null}
              </div>

              {interviewPrepResult ? (
                <div className="resume-match-results" aria-live="polite">
                  <section className="prep-priority-card">
                    <h2>Preparation Priority</h2>
                    <div className="prep-priority-grid">
                      <div className="prep-priority-group">
                        <h3>High Priority</h3>
                        {interviewPrepResult.priority.high.length > 0 ? (
                          <div className="keyword-list">
                            {interviewPrepResult.priority.high.map((skill) => (
                              <span
                                className="prep-priority-tag prep-priority-high"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p>No high-priority areas identified.</p>
                        )}
                      </div>
                      <div className="prep-priority-group">
                        <h3>Medium Priority</h3>
                        {interviewPrepResult.priority.medium.length > 0 ? (
                          <div className="keyword-list">
                            {interviewPrepResult.priority.medium.map((skill) => (
                              <span
                                className="prep-priority-tag prep-priority-medium"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p>No medium-priority areas identified.</p>
                        )}
                      </div>
                      <div className="prep-priority-group">
                        <h3>Lower Priority</h3>
                        {interviewPrepResult.priority.lower.length > 0 ? (
                          <div className="keyword-list">
                            {interviewPrepResult.priority.lower.map((skill) => (
                              <span
                                className="prep-priority-tag prep-priority-lower"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p>No lower-priority areas identified.</p>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="match-results-grid">
                    <article className="match-result-card">
                      <h2>Interview Focus</h2>
                      {interviewPrepResult.focus.length > 0 ? (
                        <div className="keyword-list">
                          {interviewPrepResult.focus.map((focus) => (
                            <span className="match-skill-tag" key={focus}>
                              {focus}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No supported interview focus areas found.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>Likely Interview Questions</h2>
                      {interviewPrepResult.likelyQuestions.length > 0 ? (
                        <ul>
                          {interviewPrepResult.likelyQuestions.map(
                            (question) => (
                              <li key={question}>{question}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>No skill-based questions were generated.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>Resume-Based Questions</h2>
                      {interviewPrepResult.resumeQuestions.length > 0 ? (
                        <ul>
                          {interviewPrepResult.resumeQuestions.map(
                            (question) => (
                              <li key={question}>{question}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>No supported resume experience keywords found.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>Gap / Risk Questions</h2>
                      {interviewPrepResult.gapQuestions.length > 0 ? (
                        <ul>
                          {interviewPrepResult.gapQuestions.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No supported missing-skill risks found.</p>
                      )}
                    </article>

                    <article className="match-result-card">
                      <h2>STAR Stories to Prepare</h2>
                      <ul>
                        {interviewPrepResult.starStories.map((story) => (
                          <li key={story}>{story}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="match-result-card">
                      <h2>Final Preparation Checklist</h2>
                      <ul className="prep-checklist">
                        {interviewPrepResult.checklist.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </div>
              ) : null}

              <p className="resume-match-disclaimer">
                Interview Prep V1 uses local rule-based analysis. Questions are
                generated only from the job description and resume text
                provided.
              </p>
            </div>
          </section>
        )}
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-form-title"
          >
            <h2 id="job-form-title">
              {editingJobId !== null ? 'Edit Job' : 'Add a Job'}
            </h2>
            <form onSubmit={submitJob}>
              <label className="field">
                Company
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={updateField}
                  placeholder="ByteDance"
                />
              </label>

              <label className="field">
                Role
                <input
                  name="role"
                  type="text"
                  value={form.role}
                  onChange={updateField}
                  placeholder="Product Manager"
                />
              </label>

              <label className="field">
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                Source
                <select
                  name="source"
                  value={form.source}
                  onChange={updateField}
                >
                  {SOURCE_OPTIONS.map((source) => (
                    <option key={source}>{source}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                Application Date
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={updateField}
                />
              </label>

              <label className="field">
                Job Description
                <textarea
                  name="jobDescription"
                  rows="5"
                  value={form.jobDescription}
                  onChange={updateField}
                  placeholder="Paste the job description here"
                />
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingJobId !== null ? 'Save Changes' : 'Save Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {jobToDelete ? (
        <div className="modal-backdrop">
          <div
            className="modal modal-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-job-title"
          >
            <h2 id="delete-job-title">Delete this application?</h2>
            <p>
              {jobToDelete.company} — {jobToDelete.role}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setJobToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={deleteJob}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
