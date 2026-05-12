import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-logo" to="/">
          Sudok<span>o</span>
        </Link>
        <div className="landing-nav-actions">
          {!isAuthenticated ? (
            <Link className="landing-nav-link" to="/login">
              Sign In
            </Link>
          ) : null}
          <Link className="landing-nav-button" to="/play">
            {isAuthenticated ? 'Open App' : 'Sign Up'}
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <h1>
            Think Sharper.
            <br />
            Solve Better.
          </h1>
          <p>
            Play clean puzzles, build better solving habits, compete in Daily Challenge,
            and use Pro tools like <strong>AI Coach</strong> when you want deeper guidance.
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

        <div className="landing-board-visual">
          <img src="/board-pic.png" alt="Sudoku board preview" />
        </div>
      </section>
    </main>
  )
}
