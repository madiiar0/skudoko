import { useState } from 'react'
import { BadgeCheck, Brain, GraduationCap, HeartHandshake, Lightbulb, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import PageTopbar from '../components/PageTopbar'
import { useAuth } from '../hooks/useAuth'

const BENEFITS = [
  { icon: XCircle, title: 'No ads', description: 'A cleaner Sudoku board with fewer interruptions.' },
  { icon: Lightbulb, title: 'Unlimited tips', description: 'Planned Pro benefit for help when you need it.' },
  { icon: Brain, title: 'AI Coach', description: 'Future coaching for smarter solving patterns.' },
  { icon: GraduationCap, title: 'Sudoku course', description: 'A guided path from basics to advanced strategies.' },
  { icon: BadgeCheck, title: 'Cool Pro badge', description: 'Show Pro status across your account.' },
  { icon: HeartHandshake, title: 'Support developers', description: 'Help fund continued Sudoku improvements.' },
]

function UpgradeModal({ isSubmitting, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="history-modal upgrade-modal">
        <h2>Activate Pro</h2>
        <p>
          Stripe payment is coming soon. For now, confirming will activate Pro on your account.
        </p>
        <div className="history-modal-actions">
          <button type="button" className="history-modal-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="history-action" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Activating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  const { user, activatePro } = useAuth()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAnnual = billingCycle === 'annual'
  const price = isAnnual ? '$29.99' : '$2.99'
  const period = isAnnual ? '/yr' : '/mo'

  async function handleConfirmUpgrade() {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await activatePro()
      setShowModal(false)
      toast.success('Pro activated on your account.')
    } catch (error) {
      toast.error(error.message || 'Unable to activate Pro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="upgrade-page">
      <PageTopbar
        title="Upgrade to Pro"
        subtitle="A simulated Pro plan for the first version. Stripe and real subscription billing will come later."
      />

      <section className="upgrade-hero">
        <div className="upgrade-hero-copy">
          <span className="upgrade-kicker">
            Sudoko Pro
          </span>
          <h2>Make every puzzle session feel premium.</h2>
          <p>
            Unlock a Pro identity now and get ready for future coaching, courses, and a cleaner
            solving experience.
          </p>
        </div>

        <div className="upgrade-pricing-card">
          <div className="billing-toggle" aria-label="Billing cycle">
            <button
              type="button"
              className={!isAnnual ? 'billing-toggle-active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={isAnnual ? 'billing-toggle-active' : ''}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <span>Save 16%</span>
            </button>
          </div>

          <div className="upgrade-price">
            <strong>{price}</strong>
            <span>{period}</span>
          </div>
          <p className="upgrade-price-note">
            {isAnnual ? 'Best value for regular Sudoku players.' : 'Simple monthly simulated plan.'}
          </p>

          {!user?.isPro ? (
            <button type="button" className="upgrade-primary-button" onClick={() => setShowModal(true)}>
              Upgrade to Pro {isAnnual ? 'Annual' : 'Monthly'}
            </button>
          ) : (
            <div className="upgrade-current-plan">You are already Pro.</div>
          )}
        </div>
      </section>

      <section className="upgrade-comparison">
        <div className="upgrade-plan-card">
          <h3>Free</h3>
          <p>Core Sudoku gameplay, Daily Challenge, History, notes, tips, and progress sync.</p>
          <strong>$0</strong>
        </div>
        <div className="upgrade-plan-card upgrade-plan-card-pro">
          <h3>Pro</h3>
          <p>Everything in Free plus the Pro badge now and planned premium features later.</p>
          <strong>{price}{period}</strong>
        </div>
      </section>

      <section className="upgrade-benefits-grid">
        {BENEFITS.map(benefit => {
          const Icon = benefit.icon

          return (
            <article key={benefit.title} className="upgrade-benefit">
              <Icon size={19} />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          )
        })}
      </section>

      {showModal ? (
        <UpgradeModal
          isSubmitting={isSubmitting}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmUpgrade}
        />
      ) : null}
    </div>
  )
}
