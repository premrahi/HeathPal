import { useEffect, useState } from 'react';

const features = [
  { number: '01', title: 'Your health profile', description: 'One place for the details that make your care personal.' },
  { number: '02', title: 'Medical reports', description: 'Keep your reports organized and easy to find.' },
  { number: '03', title: 'Vitals tracking', description: 'Follow everyday measurements and see changes over time.' },
];

export default function App() {
  const [status, setStatus] = useState('Checking connection');
  const [checking, setChecking] = useState(false);

  async function checkConnection(signal) {
    setChecking(true);
    try {
      const response = await fetch('/api/health', { signal });
      const data = await response.json();
      setStatus(response.ok && data.database === 'connected' ? 'API & database connected' : 'Database unavailable');
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('API offline — start the backend');
    } finally {
      if (!signal?.aborted) setChecking(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    checkConnection(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="#home" aria-label="HealthPal home"><span className="brand-icon">+</span>HealthPal<span className="brand-dot">.</span></a>
        <span className="tag">MERN starter</span>
      </header>
      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A little clarity. Better care.</p>
            <h1>Your health,<br /><span>all together.</span></h1>
            <p className="intro">The beginning of a simpler way to organize your health. A clean foundation for your profile, reports, and everyday wellbeing.</p>
            <a className="button" href="#foundation">Explore the foundation <span aria-hidden="true">↗</span></a>
            <p className="fine-print">Development scaffold · Features are planned</p>
          </div>
          <aside className="connection-card" aria-labelledby="connection-title">
            <div className="card-heading"><span className="eyebrow">System overview</span><span className="small-cross" aria-hidden="true">✚</span></div>
            <h2 id="connection-title">Ready to grow.</h2>
            <p>Your application starts with four building blocks.</p>
            <dl className="stack">
              <div><dt>MongoDB</dt><dd>Database</dd></div>
              <div><dt>Express</dt><dd>API layer</dd></div>
              <div><dt>React</dt><dd>Interface</dd></div>
              <div><dt>Node.js</dt><dd>Runtime</dd></div>
            </dl>
            <div className="connection"><p role="status"><span className={status.includes('connected') ? 'dot online' : 'dot'} />{status}</p><button onClick={() => checkConnection()} disabled={checking}>{checking ? 'Checking…' : 'Retry'}</button></div>
          </aside>
        </section>
        <section className="foundation" id="foundation" aria-labelledby="foundation-title">
          <div className="section-heading"><div><p className="eyebrow">The next steps</p><h2 id="foundation-title">Space for what matters.</h2></div><span className="planned-label">Planned modules</span></div>
          <div className="features">{features.map(feature => <article className="feature" key={feature.number}><span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.description}</p><span className="feature-status">Coming in a future milestone</span></article>)}</div>
        </section>
      </main>
      <footer><span>HealthPal · Built one step at a time.</span><span>MongoDB / Express / React / Node.js</span></footer>
    </div>
  );
}
