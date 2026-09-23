import { useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal'

/**
 * Marketing landing page — the "sell it later" foundation.
 * Pricing CTAs are honest stubs until payments (Stripe) are wired up.
 */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__badge">⚙️ Interactive • Self-paced • Arena Simulation</div>
        <h1 className="hero__title">
          Go from <span className="hero__accent">zero</span> to{' '}
          <span className="hero__accent">hero</span> in Arena Simulation
        </h1>
        <p className="hero__sub">
          A complete mini-course with live in-browser simulations, animated diagrams, scored
          quizzes and hands-on projects — learn discrete-event simulation by <i>doing</i> it.
        </p>
        <div className="hero__cta">
          <button className="btn btn--primary" onClick={() => navigate('/readme')}>
            Start the course — free
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See pricing
          </button>
        </div>
      </section>

      <section className="features">
        {[
          {
            icon: '🎮',
            title: 'Live mini-simulations',
            text: 'Run a real discrete-event simulation in your browser — slide arrival and service rates, watch queues form, and feel ρ go unstable.',
          },
          {
            icon: '🎨',
            title: 'Animated diagrams',
            text: 'Event clocks, warm-up curves, priority queues and flow logic — illustrated with motion, not walls of text.',
          },
          {
            icon: '🧠',
            title: 'Scored quizzes',
            text: '80 practice questions with instant reveal, self-scoring and a running grade that persists between visits.',
          },
          {
            icon: '🗺️',
            title: 'Structured path',
            text: 'Nine lessons from simulation fundamentals to full case-study projects, each with checkpoints.',
          },
          {
            icon: '🔍',
            title: 'Instant search',
            text: 'Ctrl+K full-text search across every lesson, quiz and exercise.',
          },
          {
            icon: '📊',
            title: 'Progress tracking',
            text: 'Mark lessons complete and watch your course progress bar fill up — saved locally.',
          },
        ].map((f, i) => (
          <Reveal key={f.title} className="feature-card" delay={i * 70}>
            <div className="feature-card__icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </Reveal>
        ))}
      </section>

      <section className="pricing" id="pricing">
        <h2>Simple pricing</h2>
        <p className="pricing__sub">Start free. Upgrade when you're ready for the full experience.</p>
        <div className="pricing__grid">
          <div className="price-card">
            <div className="price-card__name">Free</div>
            <div className="price-card__price">
              $0<span>/forever</span>
            </div>
            <ul>
              <li>Lessons 1–3 (fundamentals)</li>
              <li>Interactive mini-simulation</li>
              <li>Sample quiz</li>
              <li>Community updates</li>
            </ul>
            <button className="btn btn--ghost btn--block" onClick={() => navigate('/readme')}>
              Start learning
            </button>
          </div>
          <div className="price-card price-card--featured">
            <div className="price-card__tag">Most popular</div>
            <div className="price-card__name">Pro</div>
            <div className="price-card__price">
              $19<span>/one-time</span>
            </div>
            <ul>
              <li>All 9 lessons + 3 projects</li>
              <li>All quizzes &amp; 12 build challenges</li>
              <li>Animated diagrams &amp; calculators</li>
              <li>Lifetime updates</li>
            </ul>
            <button
              className="btn btn--primary btn--block"
              onClick={() => alert('Payments coming soon — thanks for your interest! 🎉')}
            >
              Get Pro — coming soon
            </button>
          </div>
        </div>
        <p className="pricing__note">
          🔒 Payments (Stripe) are not wired up yet — buttons are placeholders.
        </p>
      </section>

      <footer className="landing-footer">
        <p>Built with React + TypeScript + Vite · Content lives in plain Markdown.</p>
      </footer>
    </div>
  )
}
