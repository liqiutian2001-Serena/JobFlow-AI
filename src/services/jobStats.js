// Cumulative funnel derived only from the current jobs, never persisted separately.
export function calculateJobStats(jobs) {
  const applications = jobs.length
  const screening = jobs.filter((job) =>
    ['Screening', 'Interview', 'Final Round', 'Offer'].includes(job.status),
  ).length
  const interview = jobs.filter((job) =>
    ['Interview', 'Final Round', 'Offer'].includes(job.status),
  ).length
  const finalRound = jobs.filter((job) =>
    ['Final Round', 'Offer'].includes(job.status),
  ).length
  const offers = jobs.filter((job) => job.status === 'Offer').length
  const interviewRate = applications ? Math.round(interview / applications * 100) : 0

  return { applications, screening, interview, finalRound, offers, interviewRate }
}
