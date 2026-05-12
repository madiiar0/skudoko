import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

import PageTopbar from '../components/PageTopbar'
import { getDailyChallengeLeaderboard } from '../api/dailyChallenge'
import DailyLeaderboard from './daily/DailyLeaderboard'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadLeaderboard() {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await getDailyChallengeLeaderboard()
        if (isActive) {
          setLeaderboard(response?.leaderboard || [])
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || 'Unable to load leaderboard.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <div className="history-page leaderboard-page">
      <PageTopbar
        title="Leaderboard"
        subtitle="Daily Challenge rankings by lowest final time."
      />

      {loadError ? (
        <div className="history-empty">
          <Trophy size={34} />
          <h2>Leaderboard unavailable</h2>
          <p>{loadError}</p>
        </div>
      ) : (
        <DailyLeaderboard leaderboard={leaderboard} isLoading={isLoading} />
      )}
    </div>
  )
}
