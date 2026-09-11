import { analyzeJD, matchResumeToJD, generateInterviewPrep, extractRequiredSkills, extractResumeSkills, generateLikelyQuestions } from './basicAnalysis.js'

// Adapt the existing local analyses to the same result shape used by AI.
export function basicJD(jd) {
  const result = analyzeJD(jd)
  return {
    coreResponsibilities: result.responsibilities, hardSkills: result.hardSkills,
    softSkills: result.softSkills, keywords: result.keywords,
    niceToHave: result.niceToHave, interviewFocus: result.interviewFocus,
    jdFocus: Object.fromEntries(result.focus.map(({ label, level }) => [label.toLowerCase(), level])),
  }
}

export function basicResume(jd, resume) {
  const result = matchResumeToJD(jd, resume)
  return {
    matchSummary: result.requiredSkills.length
      ? 'Local keyword comparison only. A missing skill means it was not detected in the resume; matching words do not verify proficiency.'
      : 'Not enough supported skill evidence to assess this role. Review the JD and resume manually.',
    matchLevel: { 'Strong Match': 'High', 'Moderate Match': 'Medium', 'Limited Match': 'Low' }[result.matchLevel],
    matchedSkills: result.matchedSkills.slice(0, 10), missingSkills: result.missingSkills.slice(0, 10),
    resumeStrengths: result.strengths, improvementSuggestions: result.suggestions,
    interviewRiskAreas: result.interviewRisks, keywordsToEmphasize: result.keywordsToEmphasize,
  }
}

const extraQuestions = [
  ['SQL', /\bsql\b/i, 'How would you use SQL to investigate a change in a product metric?'],
  ['Product Metrics', /product metrics?/i, 'Which product metrics would you choose for this role, and why?'],
  ['E-commerce', /e-commerce|ecommerce/i, 'How would you identify and improve the biggest drop-off in an e-commerce purchase funnel?'],
  ['Operations', /\boperations\b/i, 'How would you identify an operational bottleneck and measure the impact of a process improvement?'],
  ['Creator / Influencer', /creator|influencer/i, 'How would you evaluate a creator campaign beyond impressions?'],
  ['Marketing Product', /marketing/i, 'How would you connect a marketing initiative to product activation and retention?'],
]

export function basicInterview(jd, resume) {
  const legacy = generateInterviewPrep(jd, resume)
  const required = extractRequiredSkills(jd)
  const demonstrated = extractResumeSkills(resume)
  const combined = [...new Set([...required, ...demonstrated])]
  const extra = extraQuestions.filter(([, pattern]) => pattern.test(jd + '\n' + resume))
  const questions = [...generateLikelyQuestions(combined), ...extra.map(([, , question]) => question)]
  const gaps = required.filter((skill) => !demonstrated.includes(skill))
  return {
    highProbabilityQuestions: questions.slice(0, 8),
    resumeQuestions: [
      ...demonstrated.map((skill) => `Your resume mentions ${skill}. What was your personal contribution, and what evidence can you discuss${required.includes(skill) ? ' for this JD requirement' : ''}?`),
      ...legacy.resumeQuestions,
    ].slice(0, 6),
    jdQuestions: [...required.map((skill) => `The JD mentions ${skill}. How would you approach this requirement in the role?`),
      ...extra.filter(([, pattern]) => pattern.test(jd)).map(([, , question]) => question)].slice(0, 6),
    behavioralQuestions: combined.length ? [
      `Describe a challenge related to ${combined[0]}. Use a real example if available; otherwise clearly describe a hypothetical approach.`,
      ...legacy.starStories.map((story) => `Which real example could you use? ${story}`),
    ].slice(0, 5) : [],
    productQuestions: questions.filter((question) => /product|feature|metric|funnel|conversion/i.test(question)).slice(0, 5),
    riskAreas: gaps.length ? gaps.map((skill) => `${skill} is mentioned in the JD but was not detected in your resume. Explain the gap honestly.`).slice(0, 5)
      : ['Keyword matching cannot verify experience. Prepare evidence for the requirements in the JD.'],
    preparationPoints: [
      ...(combined.length ? [`Prepare real examples connecting ${combined.slice(0, 3).join(', ')} to this role.`] : ['No supported topics detected. Add more specific JD and resume details.']),
      'Only add experience, skills or numbers if they are true. Clearly label hypothetical answers.',
      ...legacy.checklist,
    ].slice(0, 6),
  }
}
