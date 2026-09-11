import { useEffect, useState } from 'react'
import { getAIStatus, analyzeJD, matchResume, generateInterviewPrep, AI_UNAVAILABLE } from '../services/aiService'
import { basicJD, basicResume, basicInterview } from '../services/basicResults'
import { SAMPLE_JD, RESUME_MATCH_SAMPLE_JD, RESUME_MATCH_SAMPLE_RESUME } from '../services/basicAnalysis'
import { readSavedResume } from '../services/resumeStorage'

const pages = {
  'jd-analyzer': { title: 'JD Analyzer', subtitle: 'Understand what the role really requires before you apply.', button: 'Analyze JD', ai: analyzeJD, basic: basicJD },
  'resume-match': { title: 'Resume Match', subtitle: 'Compare your real experience with the requirements of the role.', button: 'Match Resume', ai: matchResume, basic: basicResume },
  'interview-prep': { title: 'Interview Prep', subtitle: 'Prepare for the questions most likely to come up in your interview.', button: 'Generate Interview Prep', ai: generateInterviewPrep, basic: basicInterview },
}
const labels = {
  coreResponsibilities: 'Core Responsibilities', hardSkills: 'Hard Skills', softSkills: 'Soft Skills',
  keywords: 'Keywords', niceToHave: 'Nice to Have', interviewFocus: 'Interview Focus', jdFocus: 'JD Focus',
  matchSummary: 'Match Summary', matchLevel: 'Match Level', matchedSkills: 'Matched Skills', missingSkills: 'Missing Skills',
  resumeStrengths: 'Resume Strengths', improvementSuggestions: 'Improvement Suggestions', interviewRiskAreas: 'Interview Risk Areas', keywordsToEmphasize: 'Keywords to Emphasize',
  highProbabilityQuestions: 'High Probability Questions', resumeQuestions: 'Resume Questions', jdQuestions: 'JD Questions',
  behavioralQuestions: 'Behavioral Questions', productQuestions: 'Product Questions', riskAreas: 'Risk Areas', preparationPoints: 'Preparation Points',
}

export default function AnalysisPage({ kind, job = null, onBackToJob }) {
  const page = pages[kind]
  const needsResume = kind !== 'jd-analyzer'
  // App remounts this page when its module or job context changes.
  const [jd, setJD] = useState(job?.jobDescription ?? '')
  const [savedResume] = useState(() => needsResume ? readSavedResume() : { text: '', error: '' })
  const [resume, setResume] = useState(savedResume.text)
  const [status, setStatus] = useState(null)
  const [statusFailed, setStatusFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)
  const [result, setResult] = useState(null)
  const [resultMode, setResultMode] = useState('Basic')
  const aiActive = status?.enabled && status?.configured

  useEffect(() => {
    let current = true
    getAIStatus().then((value) => { if (current) setStatus(value) })
      .catch(() => { if (current) setStatusFailed(true) })
    return () => { current = false }
  }, [])

  function resetResult() {
    setResult(null)
    setError('')
    setFallback(false)
  }

  async function analyze(useBasic = false) {
    if (busy) return
    resetResult()
    if (!jd.trim() || (needsResume && !resume.trim())) {
      setError(needsResume ? 'Please paste a job description and your resume.' : 'Please paste a job description first.')
      return
    }
    if (useBasic || !aiActive) {
      setResult(page.basic(jd, resume))
      setResultMode('Basic')
      return
    }
    setBusy(true)
    try {
      setResult(await page.ai(jd, resume))
      setResultMode('AI')
    } catch {
      setError(AI_UNAVAILABLE)
      setFallback(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="resume-match-page">
      <div className="section-inner">
        <header className="resume-match-header">
          <h1>{page.title}</h1><p>{page.subtitle}</p>
        </header>
        {job && <div className="job-context">
          <p>Analyzing for: <strong>{job.company} — {job.role}</strong></p>
          <button type="button" className="btn btn-secondary" onClick={onBackToJob}>Back to Job</button>
        </div>}
        <div className="analysis-mode" role="status">
          <strong>{aiActive ? 'AI Analysis Mode' : 'Basic Analysis Mode'}</strong>
          <span className="match-skill-tag">AI Ready</span>
          <p>{statusFailed ? AI_UNAVAILABLE : !status ? 'Checking AI availability. Basic analysis is available.'
            : !status.enabled ? 'AI features are ready but currently disabled.'
              : !status.configured ? 'AI is enabled but not configured. Basic analysis is available.'
                : 'AI is enabled. Your text is sent for analysis only when you click the button.'}</p>
        </div>
        <div className="resume-match-input-card">
          {needsResume && !savedResume.text && <p className="resume-match-disclaimer">
            Save your resume in My Resume to reuse it automatically.
          </p>}
          {savedResume.error && <p className="resume-match-error" role="alert">{savedResume.error} You can still enter it manually.</p>}
          <div className={needsResume ? 'resume-match-inputs' : ''}>
            <label className="resume-match-field" htmlFor="analysis-jd">Job Description
              <textarea id="analysis-jd" disabled={busy} value={jd} onChange={(event) => { setJD(event.target.value); resetResult() }} placeholder="Paste the full job description here..." />
            </label>
            {needsResume && <label className="resume-match-field" htmlFor="analysis-resume">Resume / Experience
              <textarea id="analysis-resume" disabled={busy} value={resume} onChange={(event) => { setResume(event.target.value); resetResult() }} placeholder="Paste your resume or real experience here..." />
            </label>}
          </div>
          <div className="resume-match-actions">
            <button className="btn btn-primary" disabled={busy} onClick={() => analyze()}>{busy ? 'Analyzing...' : page.button}</button>
            <button className="btn btn-secondary" disabled={busy} onClick={() => { setJD(needsResume ? RESUME_MATCH_SAMPLE_JD : SAMPLE_JD); setResume(needsResume ? RESUME_MATCH_SAMPLE_RESUME : ''); resetResult() }}>Load Sample</button>
            <button className="btn btn-plain" disabled={busy} onClick={() => { setJD(''); setResume(''); resetResult() }}>Clear</button>
          </div>
          {error && <p className="resume-match-error" role="alert">{error}</p>}
          {(fallback || aiActive) && <button className="btn btn-secondary" disabled={busy} onClick={() => analyze(true)}>Use Basic Analysis</button>}
        </div>
        {result && <div className="resume-match-results" aria-live="polite">
          <p><strong>{resultMode} Analysis Result</strong></p>
          <div className="match-results-grid">
            {Object.entries(result).map(([key, value]) => <article className="match-result-card" key={key}>
              <h2>{labels[key]}</h2>
              {Array.isArray(value) ? value.length ? <ul>{value.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>No supporting evidence detected.</p>
                : typeof value === 'object' ? <ul>{Object.entries(value).map(([name, level]) => <li key={name}>{name === 'ai' ? 'AI' : name.charAt(0).toUpperCase() + name.slice(1)}: {level}</li>)}</ul>
                  : <p>{value}</p>}
            </article>)}
          </div>
        </div>}
        <p className="resume-match-disclaimer">Basic analysis uses local keyword rules and may miss context or negation. Review results against your original text. Only describe experience you genuinely have.</p>
      </div>
    </section>
  )
}
