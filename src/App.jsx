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
  const { jobs, counts } = data

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Keep the page usable if browser storage is unavailable.
    }
  }, [data])

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
  }

  function loadSampleJD() {
    setJdText(SAMPLE_JD)
    setJdAnalysis(null)
    setJdError('')
  }

  function handleAnalyzeJD() {
    if (!jdText.trim()) {
      setJdAnalysis(null)
      setJdError('Please paste a job description first.')
      return
    }

    setJdAnalysis(analyzeJD(jdText))
    setJdError('')
  }

  function clearJD() {
    setJdText('')
    setJdAnalysis(null)
    setJdError('')
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
            <span>Resume Match</span>
            <span>Interview Prep</span>
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
        ) : (
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
                  >
                    Analyze JD
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadSampleJD}
                  >
                    Load Sample JD
                  </button>
                  <button
                    type="button"
                    className="btn btn-plain"
                    onClick={clearJD}
                  >
                    Clear
                  </button>
                </div>
                {jdError ? (
                  <p className="jd-error" role="alert">
                    {jdError}
                  </p>
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
                JD Analyzer V1 uses local keyword analysis. AI-powered analysis
                will be added in the next version.
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
