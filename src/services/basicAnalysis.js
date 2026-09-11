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


export { SAMPLE_JD, RESUME_MATCH_SAMPLE_JD, RESUME_MATCH_SAMPLE_RESUME, analyzeJD, matchResumeToJD, generateInterviewPrep, extractRequiredSkills, extractResumeSkills, generateLikelyQuestions }
