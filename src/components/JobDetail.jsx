export default function JobDetail({ job, onBack, onEdit, onAnalyze }) {
  return (
    <section className="jobs-page">
      <div className="section-inner job-detail">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Jobs</button>
        {job ? <>
          <header className="job-detail-heading">
            <h1>{job.company}</h1>
            <p>{job.role}</p>
          </header>
          <dl className="job-detail-meta">
            <div><dt>Status</dt><dd>{job.status}</dd></div>
            <div><dt>Source</dt><dd>{job.source}</dd></div>
            <div><dt>Application Date</dt><dd>{job.date || '—'}</dd></div>
          </dl>
          <div className="resume-match-actions">
            <button type="button" className="btn btn-primary" onClick={() => onAnalyze('jd-analyzer')}>Analyze JD</button>
            <button type="button" className="btn btn-secondary" onClick={() => onAnalyze('resume-match')}>Match Resume</button>
            <button type="button" className="btn btn-secondary" onClick={() => onAnalyze('interview-prep')}>Prepare Interview</button>
            <button type="button" className="btn btn-plain" onClick={onEdit}>Edit Job</button>
          </div>
          <article className="match-result-card job-description">
            <h2>Job Description</h2>
            <p>{job.jobDescription?.trim() ? job.jobDescription : 'No job description saved for this application.'}</p>
          </article>
        </> : <p>This application is no longer available.</p>}
      </div>
    </section>
  )
}
