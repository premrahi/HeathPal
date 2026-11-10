import { Link } from 'react-router-dom';
import { Activity, FileText, Plus, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function AuthBrand() { return <Link to="/" className="brand"><span className="brand-icon"><Plus size={25} /></span>HealthPal<span className="brand-dot">.</span></Link>; }
export function AuthLayout({ children }) {
  return <div className="auth-page"><aside className="auth-aside"><AuthBrand /><div className="auth-aside-copy"><p className="eyebrow">YOUR HEALTH, TOGETHER</p><h2>A little clarity.<br />A space of your own.</h2><p>The everyday details and the bigger picture, brought together with care.</p><div className="auth-aside-list"><div><FileText size={19} />Your reports, privately organized</div><div><Activity size={19} />Your everyday vitals, tracked</div><div><Sparkles size={19} />Explanations in your language</div></div></div><small>HealthPal · One step at a time.</small></aside><main id="main" tabIndex={-1} className="auth-panel"><div className="auth-form"><div className="auth-mobile-brand"><AuthBrand /></div>{children}</div></main></div>;
}
export function PasswordInput({ name = 'password', autoComplete = 'current-password', minLength = 10, ...props }) {
  const [show, setShow] = useState(false);
  return <div className="password-field"><input id={name} name={name} type={show ? 'text' : 'password'} required minLength={minLength} maxLength={128} autoComplete={autoComplete} {...props} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>;
}
