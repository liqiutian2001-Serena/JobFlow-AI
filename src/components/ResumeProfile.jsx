import { useState } from 'react'
import { readSavedResume, RESUME_STORAGE_KEY } from '../services/resumeStorage'

export default function ResumeProfile() {
  const [initialResume] = useState(readSavedResume)
  const [resume, setResume] = useState(initialResume.text)
  const [error, setError] = useState(initialResume.error)
  const [message, setMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  function saveResume() {
    setMessage('')
    if (!resume.trim()) {
      setError('Please paste your resume or experience first.')
      return
    }
    try {
      localStorage.setItem(RESUME_STORAGE_KEY, resume)
      setError('')
      setMessage('Resume saved.')
    } catch {
      setError('Your resume could not be saved in this browser. Please try again.')
    }
  }

  function clearResume() {
    setConfirmClear(false)
    setMessage('')
    try {
      localStorage.removeItem(RESUME_STORAGE_KEY)
      setResume('')
      setError('')
      setMessage('Saved resume cleared.')
    } catch {
      setError('Your saved resume could not be cleared. Please try again.')
    }
  }

  return (
    <section className="resume-match-page">
      <div className="section-inner">
        <header className="resume-match-header">
          <h1>My Resume</h1>
          <p>Save your experience once and reuse it across JobFlow AI.</p>
        </header>
        <div className="resume-match-input-card">
          {!resume.trim() && <p className="input-hint">Save your resume here to reuse it in Resume Match and Interview Prep.</p>}
          <label className="resume-match-field" htmlFor="profile-resume">Resume / Experience
            <textarea
              id="profile-resume"
              rows={16}
              value={resume}
              placeholder="Paste your resume, internship experience, projects, education and skills here..."
              onChange={(event) => { setResume(event.target.value); setError(''); setMessage('') }}
            />
          </label>
          <div className="resume-match-actions">
            <button type="button" className="btn btn-primary" onClick={saveResume}>Save Resume</button>
            <button type="button" className="btn btn-plain action-delete" onClick={() => setConfirmClear(true)}>Clear</button>
          </div>
          {error && <p className="resume-match-error" role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
        </div>
        <p className="resume-match-disclaimer">Your resume is currently stored only in this browser.</p>
      </div>
      {confirmClear && <div className="modal-backdrop">
        <div className="modal modal-confirm" role="dialog" aria-modal="true" aria-labelledby="clear-resume-title"
          onKeyDown={(event) => { if (event.key === 'Escape') setConfirmClear(false) }}>
          <h2 id="clear-resume-title">Clear saved resume?</h2>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" autoFocus onClick={() => setConfirmClear(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={clearResume}>Clear</button>
          </div>
        </div>
      </div>}
    </section>
  )
}
