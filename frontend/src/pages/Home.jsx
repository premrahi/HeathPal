import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  Sparkles,
  Plus,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ButtonLink } from '../components/UI';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="landing-header">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Plus size={25} />
          </span>
          HealthPal<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Home navigation">
          <a href="#features">How it helps</a>
          {user ? (
            <ButtonLink to="/app/dashboard">
              Open dashboard <ArrowUpRight size={16} />
            </ButtonLink>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <ButtonLink to="/signup">
                Get started <ArrowUpRight size={16} />
              </ButtonLink>
            </>
          )}
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="landing-hero">
          <div>
            <p className="eyebrow">
              <span className="tiny-dot" /> A LITTLE CLARITY. BETTER CARE.
            </p>
            <h1>
              Your health,
              <br />
              <em>all together.</em>
            </h1>
            <p className="hero-intro">
              Your reports, your everyday numbers, your health story. Find a little more clarity in
              one personal space.
            </p>
            <div className="hero-actions">
              <ButtonLink to={user ? '/app/dashboard' : '/signup'}>
                Start your health space <ArrowUpRight size={18} />
              </ButtonLink>
              <a className="text-link" href="#features">
                Take a closer look ↓
              </a>
            </div>
            <p className="hero-footnote">
              <ShieldCheck size={15} /> Private reports. A simpler perspective.
            </p>
          </div>
          <div className="hero-visual" aria-label="Illustration of a personal health dashboard">
            <div className="visual-caption">
              <span className="tiny-dot" /> YOUR HEALTH, IN VIEW<span>Made for you</span>
            </div>
            <div className="visual-welcome">
              <span className="visual-heart">
                <HeartPulse size={27} />
              </span>
              <div>
                <small>A little check-in</small>
                <h2>A clearer picture starts here.</h2>
              </div>
            </div>
            <div className="visual-grid">
              <div className="visual-metric">
                <Activity size={22} />
                <strong>Everyday vitals</strong>
                <span>Record. Reflect. Repeat.</span>
                <svg viewBox="0 0 220 55" role="img" aria-label="Decorative trend line">
                  <path d="M0 43 L25 33 L50 38 L75 15 L100 24 L125 10 L150 22 L175 7 L200 14 L220 5" />
                </svg>
              </div>
              <div className="visual-metric warm">
                <FileText size={22} />
                <strong>Your reports</strong>
                <span>Right where you need them.</span>
                <div className="mini-paper">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
            <div className="visual-insight">
              <span className="icon-tile">
                <Sparkles size={21} />
              </span>
              <div>
                <strong>Less jargon. More understanding.</strong>
                <p>English & Roman Urdu explanations</p>
              </div>
              <ArrowUpRight size={19} />
            </div>
            <p className="visual-note">Illustrative preview · Your space starts empty</p>
          </div>
        </section>
        <section id="features" className="landing-features">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ROOM FOR WHAT MATTERS</p>
              <h2>A calmer way to keep track.</h2>
            </div>
            <p>Small tools for your bigger health story.</p>
          </div>
          <div className="feature-grid">
            {[
              [
                FileText,
                '01',
                'Reports, in one place',
                'Save your medical PDFs and images privately. Search, download, and revisit them whenever you need.',
              ],
              [
                Sparkles,
                '02',
                'Make sense of the details',
                'Choose AI explanations in English and Roman Urdu, with questions to bring to your next appointment.',
              ],
              [
                Activity,
                '03',
                'Notice your everyday',
                'Record blood pressure, glucose, weight, and pulse. See your own measurements over time.',
              ],
            ].map(([Icon, number, title, text]) => (
              <article className="feature" key={number}>
                <div className="feature-top">
                  <Icon size={23} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <p className="eyebrow">ONE SMALL STEP</p>
            <h2>Give your health story a home.</h2>
            <p>Bring the details together, one day at a time.</p>
          </div>
          <ButtonLink to={user ? '/app/dashboard' : '/signup'}>
            Let’s get started <ArrowUpRight size={18} />
          </ButtonLink>
        </section>
      </main>
      <footer className="landing-footer">
        <span>HealthPal · Your health, together.</span>
        <span>A personal organizer. Not a replacement for medical care.</span>
      </footer>
    </div>
  );
}
