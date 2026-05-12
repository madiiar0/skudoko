import { formatChallengeTime } from './time'

export default function DailyLeaderboard({ leaderboard = [], isLoading = false }) {
  return (
    <section className="daily-leaderboard-card">
      {isLoading ? (
        <div className="daily-leaderboard-empty">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="daily-leaderboard-empty">No completed results yet.</div>
      ) : (
        <div className="daily-table-wrap">
          <table className="daily-leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Final time</th>
                <th>Mistakes</th>
                <th>Tips used</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr key={`${entry.rank}-${entry.userId || entry.name}`}>
                  <td>#{entry.rank}</td>
                  <td>{entry.name}</td>
                  <td>{formatChallengeTime(entry.finalTimeSeconds)}</td>
                  <td>{entry.mistakeCount || 0}</td>
                  <td>{entry.tipsUsed || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
