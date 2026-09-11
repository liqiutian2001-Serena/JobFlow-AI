export default function EmptyJobs({ onAdd }) {
  return (
    <div className="empty-state">
      <h3>No applications yet.</h3>
      <p>Add a role to start tracking your job search.</p>
      <button type="button" className="btn btn-primary" onClick={onAdd}>Add your first job</button>
    </div>
  )
}
