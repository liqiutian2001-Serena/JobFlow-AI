import { useState } from 'react'
import './App.css'

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

const EMPTY_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  source: 'Official Website',
  date: '',
  jobDescription: '',
}

function nextCounts(counts, status) {
  const next = {
    ...counts,
    applications: counts.applications + 1,
  }

  if (status === 'Screening') {
    next.screening += 1
  }

  if (status === 'Interview') {
    next.screening += 1
    next.interview += 1
  }

  if (status === 'Final Round') {
    next.screening += 1
    next.interview += 1
    next.finalRound += 1
  }

  if (status === 'Offer') {
    next.screening += 1
    next.interview += 1
    next.finalRound += 1
    next.offer += 1
  }

  return next
}

function App() {
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [counts, setCounts] = useState({
    applications: 24,
    screening: 12,
    interview: 6,
    finalRound: 2,
    offer: 1,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const interviewRate = Math.round(
    (counts.interview / counts.applications) * 100,
  )

  function openModal() {
    setError('')
    setForm(EMPTY_FORM)
    setIsModalOpen(true)
  }

  function closeModal() {
    setError('')
    setForm(EMPTY_FORM)
    setIsModalOpen(false)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function saveJob(event) {
    event.preventDefault()

    if (!form.company.trim() || !form.role.trim()) {
      setError('Please fill in Company and Role.')
      return
    }

    const newJob = {
      id: Date.now(),
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      source: form.source,
      date: form.date,
      jobDescription: form.jobDescription,
    }

    setJobs((current) => [newJob, ...current])
    setCounts((current) => nextCounts(current, form.status))
    closeModal()
  }

  return (
    <div className="page">
      <header className="nav">
        <div className="nav-inner">
          <div className="logo">JobFlow AI</div>
          <nav className="nav-links" aria-label="Primary">
            <span>Dashboard</span>
            <span>Jobs</span>
            <span>JD Analyzer</span>
            <span>Resume Match</span>
            <span>Interview Prep</span>
          </nav>
        </div>
      </header>

      <main>
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
                onClick={openModal}
              >
                Add a Job
              </button>
              <button type="button" className="btn btn-secondary">
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
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-job-title"
          >
            <h2 id="add-job-title">Add a Job</h2>
            <form onSubmit={saveJob}>
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
                  <option>Applied</option>
                  <option>Screening</option>
                  <option>Interview</option>
                  <option>Final Round</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>

              <label className="field">
                Source
                <select
                  name="source"
                  value={form.source}
                  onChange={updateField}
                >
                  <option>Official Website</option>
                  <option>Campus</option>
                  <option>Boss</option>
                  <option>LinkedIn</option>
                  <option>Referral</option>
                  <option>Other</option>
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
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
