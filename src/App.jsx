import { useEffect, useState } from 'react'
import './App.css'
import AnalysisPage from './components/AnalysisPage'
import JobDetail from './components/JobDetail'

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
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const { jobs, counts } = data
  // Read the current job from the existing data so edits appear immediately.
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null

  function navigateTo(view) {
    setSelectedJobId(null)
    setActiveView(view)
  }

  function openJob(job) {
    setSelectedJobId(job.id)
    setActiveView('job-detail')
  }

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
              onClick={() => navigateTo('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`nav-link ${['jobs', 'job-detail'].includes(activeView) ? 'active' : ''}`}
              aria-current={['jobs', 'job-detail'].includes(activeView) ? 'page' : undefined}
              onClick={() => navigateTo('jobs')}
            >
              Jobs
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeView === 'jd-analyzer' ? 'active' : ''
              }`}
              aria-current={activeView === 'jd-analyzer' ? 'page' : undefined}
              onClick={() => navigateTo('jd-analyzer')}
            >
              JD Analyzer
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeView === 'resume-match' ? 'active' : ''
              }`}
              aria-current={activeView === 'resume-match' ? 'page' : undefined}
              onClick={() => navigateTo('resume-match')}
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
              onClick={() => navigateTo('interview-prep')}
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
                    onClick={() => navigateTo('jd-analyzer')}
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
                              onClick={() => openJob(job)}
                            >
                              Open
                            </button>
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
        ) : activeView === 'job-detail' ? (
          <JobDetail
            job={selectedJob}
            onBack={() => navigateTo('jobs')}
            onEdit={() => openEditModal(selectedJob)}
            onAnalyze={setActiveView}
          />
        ) : (
          <AnalysisPage
            key={JSON.stringify([activeView, selectedJobId])}
            kind={activeView}
            job={selectedJob}
            onBackToJob={() => setActiveView('job-detail')}
          />
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
