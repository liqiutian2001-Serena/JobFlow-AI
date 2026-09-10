import './App.css'

function App() {
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
              <button type="button" className="btn btn-primary">
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
                <p className="card-value">24</p>
              </article>
              <article className="card">
                <p className="card-label">Interviews</p>
                <p className="card-value">6</p>
              </article>
              <article className="card">
                <p className="card-label">Interview Rate</p>
                <p className="card-value">25%</p>
              </article>
              <article className="card">
                <p className="card-label">Offers</p>
                <p className="card-value">1</p>
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
                <p className="card-value">24</p>
              </article>
              <article className="funnel-step">
                <p className="card-label">Screening</p>
                <p className="card-value">12</p>
              </article>
              <article className="funnel-step">
                <p className="card-label">Interview</p>
                <p className="card-value">6</p>
              </article>
              <article className="funnel-step">
                <p className="card-label">Final Round</p>
                <p className="card-value">2</p>
              </article>
              <article className="funnel-step">
                <p className="card-label">Offer</p>
                <p className="card-value">1</p>
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
                  <tr>
                    <td>ByteDance</td>
                    <td>Product Manager</td>
                    <td>Interview</td>
                    <td>Campus</td>
                  </tr>
                  <tr>
                    <td>JD.com</td>
                    <td>Product Operations</td>
                    <td>Applied</td>
                    <td>Official Website</td>
                  </tr>
                  <tr>
                    <td>Meitu</td>
                    <td>Product Manager</td>
                    <td>Screening</td>
                    <td>Boss</td>
                  </tr>
                  <tr>
                    <td>Pinduoduo</td>
                    <td>Product Operations</td>
                    <td>Applied</td>
                    <td>Campus</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
