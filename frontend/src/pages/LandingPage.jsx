import { Link } from 'react-router-dom'
import { BadgeCheck, Brain, CalendarDays, Gamepad2, Lightbulb, Sparkles } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

const VALUE_POINTS = [
  {
    icon: Gamepad2,
    title: 'Focused gameplay',
    text: 'A clean board with keyboard input, notes, undo, mistakes, tips, and reliable progress saving.',
  },
  {
    icon: CalendarDays,
    title: 'Daily Challenge',
    text: 'Play the shared puzzle, track your time, and compare results on the leaderboard.',
  },
  {
    icon: Brain,
    title: 'AI Coach',
    text: 'Pro players can ask for board-aware hints based on the current puzzle, notes, and progress.',
  },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-logo" to="/">
          Sudok<span>o</span>
        </Link>
        <div className="landing-nav-actions">
          {!isAuthenticated ? (
            <Link className="landing-nav-link" to="/login">
              Log in
            </Link>
          ) : null}
          <Link className="landing-nav-button" to="/play">
            {isAuthenticated ? 'Open App' : 'Start Playing'}
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker">
            <Sparkles size={15} />
            Modern Sudoku
          </span>
          <h1>Sudoku that feels sharp, focused, and worth coming back to.</h1>
          <p>
            Play clean puzzles, build better solving habits, compete in Daily Challenge,
            and use Pro tools like AI Coach when you want deeper guidance.
          </p>
          <div className="landing-cta-row">
            <Link className="landing-primary-cta" to="/play">
              Play Sudoku
            </Link>
            <Link className="landing-secondary-cta" to="/daily-challenge">
              Try Daily Challenge
            </Link>
          </div>
        </div>

        <div className="landing-board-card" aria-label="Sudoku app preview">
          <div className="landing-board-top">
            <span>Medium</span>
            <strong>Daily run</strong>
          </div>
          <div className="landing-mini-board">
            {[5, 0, 0, 0, 8, 4, 0, 0, 2, 0, 7, 0, 5, 0, 0, 8, 0, 0, 9, 0, 4, 0, 0, 2, 0, 1, 0, 0, 5, 0, 8, 0, 0, 0, 2, 0].map((value, index) => (
              <span key={`${value}-${index}`} className={value ? 'landing-mini-cell-filled' : ''}>
                {value || ''}
              </span>
            ))}
          </div>
          <div className="landing-preview-meta">
            <span>Notes</span>
            <span>Mistakes: 1</span>
            <span>Tips used: 0</span>
          </div>
        </div>
      </section>

      <section className="landing-feature-row">
        {VALUE_POINTS.map(point => {
          const Icon = point.icon

          return (
            <article key={point.title} className="landing-feature-card">
              <Icon size={20} />
              <h2>{point.title}</h2>
              <p>{point.text}</p>
            </article>
          )
        })}
      </section>

      <section className="landing-pro-strip">
        <div>
          <span className="landing-pro-pill">
            <BadgeCheck size={14} />
            Pro
          </span>
          <h2>Go Pro for a cleaner, smarter Sudoku setup.</h2>
          <p>
            Remove ads, unlock unlimited tips, show your Pro badge, and use AI Coach
            for personalized help while you solve.
          </p>
        </div>
        <Link className="landing-primary-cta" to="/upgrade">
          {user?.isPro ? 'Manage Pro' : 'Upgrade to Pro'}
        </Link>
      </section>

      <section className="landing-final-cta">
        <Lightbulb size={22} />
        <h2>Ready for your next puzzle?</h2>
        <p>Start a saved game, resume your progress, or jump into today’s challenge.</p>
        <div className="landing-cta-row">
          <Link className="landing-primary-cta" to="/play">
            Start Playing
          </Link>
          <Link className="landing-secondary-cta" to="/leaderboard">
            View Leaderboard
          </Link>
        </div>
      </section>
    </main>
  )
}
